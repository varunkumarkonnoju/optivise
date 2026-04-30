package com.optivise.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import reactor.netty.http.client.HttpClient;
import io.netty.resolver.DefaultAddressResolverGroup;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ClaudeService {

    private static final Logger log = LoggerFactory.getLogger(ClaudeService.class);

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    // Lazy init to avoid ExceptionInInitializerError on startup
    private WebClient getClient() {
        return WebClient.builder()
                .baseUrl("https://api.openai.com")
                .clientConnector(new ReactorClientHttpConnector(
                        HttpClient.create().resolver(DefaultAddressResolverGroup.INSTANCE)
                ))
                .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
    }

    public String chat(String systemPrompt, List<Map<String, String>> history, String userMessage) {
        try {
            // OpenAI format: messages array with system + history + new user message
            var messages = new ArrayList<Map<String, String>>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            messages.addAll(history);
            messages.add(Map.of("role", "user", "content", userMessage));

            // OpenAI request body
            var body = Map.of(
                    "model", model,
                    "max_tokens", 1024,
                    "messages", messages
            );

            var response = getClient().post()
                    .uri("/v1/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            // OpenAI response: choices[0].message.content
            if (response != null && response.containsKey("choices")) {
                @SuppressWarnings("unchecked")
                var choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    var message = (Map<String, Object>) choices.get(0).get("message");
                    if (message != null) {
                        String content = (String) message.get("content");
                        // Strip markdown code fences like ```html ... ``` or ``` ... ```
                        if (content != null) {
                            content = content.replaceAll("(?s)^```[a-zA-Z]*\\n?", "");
                            content = content.replaceAll("(?s)\\n?```$", "");
                            content = content.trim();
                        }
                        return content;
                    }
                }
            }
        } catch (Exception e) {
            log.error("OpenAI API error: {}", e.getMessage());
        }
        return "I'm having trouble connecting to the AI service. Please check your OPENAI_API_KEY in Run Configurations.";
    }

    public String buildStoreSystemPrompt(String shopName, String storeStats) {
        return """
                You are the AI assistant for Optivise, an AI-powered growth platform for %s.
                You have access to this store's real-time data:
                %s

                Help store owners understand their performance, identify growth opportunities,
                and take action to optimize their store. Be concise, data-driven, and actionable.
                Always reference specific numbers from the store data when relevant.
                """.formatted(shopName, storeStats);
    }
}