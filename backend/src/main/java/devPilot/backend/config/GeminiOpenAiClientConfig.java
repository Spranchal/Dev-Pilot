package devPilot.backend.config;

import org.springframework.ai.openai.http.okhttp.OpenAiHttpClientBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

@Configuration
public class GeminiOpenAiClientConfig {

    @Bean
    public OpenAiHttpClientBuilderCustomizer geminiResponseNormalizer(JsonMapper jsonMapper) {
        return builder -> builder.interceptor(chain -> {
            Request request = chain.request();
            Response response = chain.proceed(request);

            if (!response.isSuccessful() || response.body() == null) {
                return response;
            }

            try {
                MediaType contentType = response.body().contentType();
                if (contentType == null || !contentType.subtype().contains("json")) {
                    return response;
                }

                String originalBody = response.body().string();
                JsonNode root = jsonMapper.readTree(originalBody);

                if (!root.isObject()) {
                    return response.newBuilder()
                            .body(ResponseBody.create(originalBody, contentType))
                            .build();
                }

                ObjectNode rootObj = (ObjectNode) root;
                boolean modified = false;

                // 1. Normalize Embeddings Response
                if (rootObj.has("data") && rootObj.get("data").isArray()) {
                    var dataArray = rootObj.get("data");
                    for (int i = 0; i < dataArray.size(); i++) {
                        JsonNode item = dataArray.get(i);
                        if (item.isObject()) {
                            ObjectNode itemObj = (ObjectNode) item;
                            if (!itemObj.has("index")) {
                                itemObj.put("index", i);
                                modified = true;
                            }
                            if (!itemObj.has("object")) {
                                itemObj.put("object", "embedding");
                                modified = true;
                            }
                        }
                    }

                    // Ensure required "usage" object exists on embedding response
                    if (!rootObj.has("usage") || !rootObj.get("usage").isObject()) {
                        ObjectNode usage = jsonMapper.createObjectNode();
                        usage.put("prompt_tokens", 0L);
                        usage.put("total_tokens", 0L);
                        rootObj.set("usage", usage);
                        modified = true;
                    } else {
                        ObjectNode usage = (ObjectNode) rootObj.get("usage");
                        if (!usage.has("prompt_tokens")) {
                            usage.put("prompt_tokens", 0L);
                            modified = true;
                        }
                        if (!usage.has("total_tokens")) {
                            usage.put("total_tokens", 0L);
                            modified = true;
                        }
                    }

                    if (!rootObj.has("model")) {
                        rootObj.put("model", "gemini-embedding-001");
                        modified = true;
                    }
                }

                // 2. Normalize Chat Response
                if (rootObj.has("choices") && rootObj.get("choices").isArray()) {
                    var choicesArray = rootObj.get("choices");
                    for (int i = 0; i < choicesArray.size(); i++) {
                        JsonNode item = choicesArray.get(i);
                        if (item.isObject()) {
                            ObjectNode itemObj = (ObjectNode) item;
                            if (!itemObj.has("index")) {
                                itemObj.put("index", i);
                                modified = true;
                            }
                        }
                    }

                    if (!rootObj.has("usage") || !rootObj.get("usage").isObject()) {
                        ObjectNode usage = jsonMapper.createObjectNode();
                        usage.put("prompt_tokens", 0L);
                        usage.put("completion_tokens", 0L);
                        usage.put("total_tokens", 0L);
                        rootObj.set("usage", usage);
                        modified = true;
                    }
                }

                String bodyToReturn = modified ? jsonMapper.writeValueAsString(rootObj) : originalBody;

                return response.newBuilder()
                        .body(ResponseBody.create(bodyToReturn, contentType))
                        .build();

            } catch (Exception e) {
                return response;
            }
        });
    }
}
