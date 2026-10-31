package devPilot.backend.services.indexing;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import devPilot.backend.entity.IndexStatus;
import devPilot.backend.entity.Repository;
import devPilot.backend.exceptions.BadRequestException;
import devPilot.backend.exceptions.NotFoundException;
import devPilot.backend.repository.RepositoryRepository;
import devPilot.backend.services.UserService;
import devPilot.backend.services.ai.RagSettings;
import devPilot.backend.services.github.GitHubRateLimiter;
import devPilot.backend.services.github.GithubApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service 
@RequiredArgsConstructor
@Slf4j 
public class IndexingService {
    private static final int VECTOR_BATCH_SIZE = 10;
    private static final int PROGRESS_EVERY_N_FILES = 5; 

    private final RepositoryRepository repositoryRepository;
    private final UserService userService;
    private final GithubApiClient githubApiClient;
    private final CodeFileFilter fileFilter;
    private final CodeChunker codeChunker;
    private final GitHubRateLimiter rateLimiter;
    private final VectorStore vectorStore;

    @Value("${app.indexing.max-file-bytes:102400}")
    private long maxFileBytes;


    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void resetOrphanedIndexingJobs() {
        try {
            List<Repository> stuckRepos = repositoryRepository.findByIndexStatus(IndexStatus.INDEXING);
            if (!stuckRepos.isEmpty()) {
                log.info("Found {} orphaned repository index jobs on startup. Resetting them to FAILED.", stuckRepos.size());
                for (Repository repo : stuckRepos) {
                    repo.setIndexStatus(IndexStatus.FAILED);
                    repo.setErrorMessage("Indexing was interrupted by server restart. Click Retry to re-index.");
                    repo.setUpdatedAt(Instant.now());
                    repositoryRepository.save(repo);
                }
            }
        } catch (Exception e) {
            log.warn("Could not check/reset orphaned indexing repositories on startup: {}", e.getMessage());
        }
    }

    public Repository startIndexing(UUID repoId, UUID userId) {
        Repository repo = repositoryRepository.findByIdAndUserId(repoId, userId)
            .orElseThrow(() -> new NotFoundException("Repository not found"));

        repo.setIndexStatus(IndexStatus.INDEXING);
        repo.setFilesProcessed(0);
        repo.setFilesTotal(0);
        repo.setChunkCount(0);
        repo.setErrorMessage(null);
        repo.setUpdatedAt(Instant.now());

        return repositoryRepository.save(repo);
    }

    @Async("indexingExecutor")
    public void indexAsync(UUID repoId, UUID userId) {
        try {
            doIndex(repoId, userId);
        } catch (Exception ex) {
            log.error("Indexing failed for repo {}", repoId, ex);
            markFailed(repoId, ex.getMessage());
        }
    }

    private void doIndex(UUID repoId, UUID userId) {
        Repository repo = repositoryRepository.findById(repoId)
                .orElseThrow(() -> new NotFoundException("Repository not found"));

        String token = userService.decryptAccessToken(
                userService.requireById(userId)
        );

        deleteExistingVectors(repoId.toString());

        Map<String, Object> tree = githubApiClient.getRepoTree(
                token, repo.getOwner(), repo.getName(), repo.getDefaultBranch()
        );

        List<String> filePaths = listIndexableFiles(tree);

        updateProgress(
                repoId, filePaths.size(), 0, 0, IndexStatus.INDEXING, null
        );

        List<Document> batch = new ArrayList<>();
        int processed = 0;
        int totalChunks = 0;

        for (String path : filePaths) {
            try {
                String content = githubApiClient.getFileContent(
                        token, repo.getOwner(), repo.getName(), path
                );

                List<Document> chunks = codeChunker.chunkFile(
                        repoId.toString(), path, content
                );

                batch.addAll(chunks);
                totalChunks += chunks.size();

                if (batch.size() >= VECTOR_BATCH_SIZE) {
                    addBatchWithRetry(repoId, batch);
                    batch.clear();
                }
            } catch (Exception ex) {
                log.warn(
                        "Skipping file {} in {}: {}",
                        path, repo.getFullName(), ex.getMessage()
                );
            }

            processed++;

            if (processed % PROGRESS_EVERY_N_FILES == 0
                    || processed == filePaths.size()) {
                updateProgress(
                        repoId, filePaths.size(), processed,
                        totalChunks, IndexStatus.INDEXING, null
                );
            }

            rateLimiter.pause();
        }

        if (!batch.isEmpty()) {
            addBatchWithRetry(repoId, batch);
            batch.clear();
        }

        markReady(
                repoId, filePaths.size(), processed,
                totalChunks, repo.getFullName()
        );
    }

    @SuppressWarnings("unchecked")
    private List<String> listIndexableFiles(Map<String, Object> tree) {
        if (tree == null || tree.get("tree") == null) {
            return List.of();
        }

        List<Map<String, Object>> entries =
                (List<Map<String, Object>>) tree.get("tree");

        return entries.stream()
                .filter(entry -> "blob".equals(String.valueOf(entry.get("type"))))
                .filter(entry -> {
                    String path = String.valueOf(entry.get("path"));
                    long size = entry.get("size") instanceof Number n
                            ? n.longValue()
                            : 0L;

                    return fileFilter.isEligible(path, size, maxFileBytes);
                })
                .map(entry -> String.valueOf(entry.get("path")))
                .toList();
    }

    private void deleteExistingVectors(String repoId) {
        try {
            var filter = new FilterExpressionBuilder()
                    .eq(RagSettings.METADATA_REPO_ID, repoId)
                    .build();

            vectorStore.delete(filter);
        } catch (Exception ex) {
            log.warn(
                    "Could not delete existing vectors for repo {}: {}",
                    repoId,
                    ex.getMessage()
            );
        }
    }

    @Transactional
    public void markFailed(UUID repoId, String errorMessage) {
        repositoryRepository.findById(repoId).ifPresent(repo -> {
            repo.setIndexStatus(IndexStatus.FAILED);
            repo.setErrorMessage(errorMessage);
            repo.setUpdatedAt(Instant.now());

            repositoryRepository.save(repo);
        });
    }

    @Transactional
    protected void updateProgress(
            UUID repoId,
            int total,
            int processed,
            int chunks,
            IndexStatus status,
            String error) {

        repositoryRepository.findById(repoId).ifPresent(repo -> {
            repo.setFilesTotal(total);
            repo.setFilesProcessed(processed);
            repo.setChunkCount(chunks);
            repo.setIndexStatus(status);
            repo.setErrorMessage(error);
            repo.setUpdatedAt(Instant.now());

            repositoryRepository.save(repo);
        });
    }

    @Transactional
    protected void markReady(
            UUID repoId,
            int totalFiles,
            int processedFiles,
            int totalChunks,
            String fullName) {

        repositoryRepository.findById(repoId).ifPresent(repo -> {
            repo.setIndexStatus(IndexStatus.READY);
            repo.setFilesTotal(totalFiles);
            repo.setFilesProcessed(processedFiles);
            repo.setChunkCount(totalChunks);
            repo.setIndexedAt(Instant.now());
            repo.setErrorMessage(null);
            repo.setUpdatedAt(Instant.now());

            repositoryRepository.save(repo);
        });

        log.info(
                "Indexed {} files ({} chunks) for {}",
                processedFiles, totalChunks, fullName
        );
    }

    private void addBatchWithRetry(UUID repoId, List<Document> batch) {
        int maxRetries = 6;
        int attempt = 0;
        while (true) {
            try {
                vectorStore.add(batch);
                // Gentle pacing delay between vector additions
                Thread.sleep(600);
                return;
            } catch (Exception ex) {
                attempt++;
                String msg = ex.getMessage() != null ? ex.getMessage() : "";
                boolean isRateLimit = msg.contains("429")
                        || msg.contains("quota")
                        || msg.contains("rate-limit")
                        || msg.contains("tokens per minute")
                        || msg.contains("free_tier_tokens");

                if (isRateLimit && attempt <= maxRetries) {
                    long waitSeconds = parseRetryAfter(msg, attempt);
                    log.warn("Gemini embedding quota limit reached for repo {} (attempt {}/{}). Pausing {}s before retrying...",
                            repoId, attempt, maxRetries, waitSeconds);
                    touchRepo(repoId);
                    try {
                        Thread.sleep(waitSeconds * 1000L);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Indexing interrupted during quota wait", ie);
                    }
                    touchRepo(repoId);
                } else {
                    if (ex instanceof RuntimeException re) {
                        throw re;
                    }
                    throw new RuntimeException(ex);
                }
            }
        }
    }

    private long parseRetryAfter(String errorMsg, int attempt) {
        try {
            java.util.regex.Matcher matcher = java.util.regex.Pattern.compile(
                    "retry in ([0-9]+(?:\\.[0-9]+)?)s",
                    java.util.regex.Pattern.CASE_INSENSITIVE
            ).matcher(errorMsg);
            if (matcher.find()) {
                double seconds = Double.parseDouble(matcher.group(1));
                return Math.max(5, (long) Math.ceil(seconds) + 3);
            }
        } catch (Exception ignored) {
        }
        return Math.min(15L * (1L << (attempt - 1)), 60L);
    }

    private void touchRepo(UUID repoId) {
        repositoryRepository.findById(repoId).ifPresent(repo -> {
            repo.setUpdatedAt(Instant.now());
            repositoryRepository.save(repo);
        });
    }
}
