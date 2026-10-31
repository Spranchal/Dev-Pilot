package devPilot.backend.services.ai;

import java.util.List;
import java.util.UUID;

import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import devPilot.backend.dto.ChatMessageResponse;
import devPilot.backend.dto.ChatResponse;
import devPilot.backend.dto.ChatSessionResponse;
import devPilot.backend.dto.CreateChatSessionRequest;
import devPilot.backend.entity.ChatMessage;
import devPilot.backend.entity.ChatSession;
import devPilot.backend.entity.IndexStatus;
import devPilot.backend.entity.MessageRole;
import devPilot.backend.entity.Repository;
import devPilot.backend.exceptions.BadRequestException;
import devPilot.backend.exceptions.NotFoundException;
import devPilot.backend.repository.ChatMessageRepository;
import devPilot.backend.repository.ChatSessionRepository;
import devPilot.backend.services.RepoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final CodeContextRetriever codeContextRetriever;
    private final ChatModel chatModel;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final RepoService repoService;
    private final CitationMapper citationMapper;

    public ChatResponse chat(Repository repository, String userMessage) {
        UUID repoId = repository.getId();
        RetrievedContext retrieved = codeContextRetriever.retrieve(repoId, userMessage);
        String systemPromptText = buildSystemPrompt(repository, retrieved.contextText());

        Prompt prompt = new Prompt(List.of(
                new SystemMessage(systemPromptText),
                new UserMessage(userMessage)
        ));

        org.springframework.ai.chat.model.ChatResponse response = chatModel.call(prompt);
        String replyText = "";
        if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
            replyText = response.getResult().getOutput().getText();
        }

        return new ChatResponse(replyText, retrieved.citations());
    }

    @Transactional
    public ChatSessionResponse createSession(UUID userId, CreateChatSessionRequest request) {
        Repository repo = repoService.requireOwned(request.repositoryId(), userId);
        String title = (request.title() != null && !request.title().isBlank())
                ? request.title().trim()
                : "Chat about " + repo.getName();

        ChatSession session = ChatSession.builder()
                .userId(userId)
                .repositoryId(repo.getId())
                .title(title)
                .build();

        session = chatSessionRepository.save(session);
        return new ChatSessionResponse(session.getId(), session.getRepositoryId(), session.getTitle(), session.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<ChatSessionResponse> listSessions(UUID userId, UUID repositoryId) {
        repoService.requireOwned(repositoryId, userId);
        return chatSessionRepository.findByUserIdAndRepositoryIdOrderByCreatedAtDesc(userId, repositoryId)
                .stream()
                .map(s -> new ChatSessionResponse(s.getId(), s.getRepositoryId(), s.getTitle(), s.getCreatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(UUID userId, UUID sessionId) {
        chatSessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new NotFoundException("Chat session not found"));

        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .map(m -> new ChatMessageResponse(
                        m.getId(),
                        m.getRole(),
                        m.getContent(),
                        citationMapper.fromJson(m.getCitations()),
                        m.getCreatedAt()
                ))
                .toList();
    }

    public SseEmitter streamReply(UUID userId, UUID sessionId, String content) {
        ChatSession session = chatSessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new NotFoundException("Chat session not found"));
        Repository repo = repoService.requireOwned(session.getRepositoryId(), userId);

        if (repo.getIndexStatus() != IndexStatus.READY) {
            throw new BadRequestException("Repository is not ready for chat yet (current status: " + repo.getIndexStatus() + ")");
        }

        ChatMessage userMsg = ChatMessage.builder()
                .sessionId(sessionId)
                .role(MessageRole.USER)
                .content(content)
                .build();
        chatMessageRepository.save(userMsg);

        SseEmitter emitter = new SseEmitter(180_000L);
        RetrievedContext retrieved = codeContextRetriever.retrieve(repo.getId(), content);
        String systemPromptText = buildSystemPrompt(repo, retrieved.contextText());

        Prompt prompt = new Prompt(List.of(
                new SystemMessage(systemPromptText),
                new UserMessage(content)
        ));

        StringBuilder fullReply = new StringBuilder();

        try {
            emitter.send(SseEmitter.event().name("citations").data(retrieved.citations()));
        } catch (Exception e) {
            log.warn("Failed to send citations event", e);
        }

        chatModel.stream(prompt).subscribe(
                chunk -> {
                    try {
                        if (chunk != null && chunk.getResult() != null && chunk.getResult().getOutput() != null) {
                            String text = chunk.getResult().getOutput().getText();
                            if (text != null && !text.isEmpty()) {
                                fullReply.append(text);
                                emitter.send(SseEmitter.event().name("delta").data(text));
                            }
                        }
                    } catch (Exception e) {
                        log.warn("Error sending SSE chunk", e);
                    }
                },
                error -> {
                    log.error("Streaming error for session {}", sessionId, error);
                    emitter.completeWithError(error);
                },
                () -> {
                    try {
                        ChatMessage assistantMsg = ChatMessage.builder()
                                .sessionId(sessionId)
                                .role(MessageRole.ASSISTANT)
                                .content(fullReply.toString())
                                .citations(citationMapper.toJson(retrieved.citations()))
                                .build();
                        chatMessageRepository.save(assistantMsg);
                        emitter.send(SseEmitter.event().name("done").data("[DONE]"));
                        emitter.complete();
                    } catch (Exception e) {
                        log.error("Error finalizing SSE stream for session {}", sessionId, e);
                        emitter.completeWithError(e);
                    }
                }
        );

        return emitter;
    }

    private String buildSystemPrompt(Repository repository, String contextText) {
        return String.format("""
                You are DevPilot, an expert AI software engineering assistant for the repository "%s" (%s).
                Your goal is to answer developer questions accurately, clearly, and concisely based on the codebase.

                Context from the repository:
                %s

                Instructions:
                1. Ground your answer in the provided code context.
                2. Refer to specific files, classes, methods, and line numbers when discussing code.
                3. If the context does not contain enough information to fully answer, state what you can deduce from the codebase and provide helpful guidance.
                4. Format your answer with clean Markdown, using appropriate fenced code blocks with language identifiers.
                """, repository.getFullName(), repository.getDefaultBranch(), contextText);
    }
}
