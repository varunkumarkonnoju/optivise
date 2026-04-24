package com.optivise.controller;

import com.optivise.dto.ChatMessageDTO;
import com.optivise.dto.ChatRequest;
import com.optivise.dto.ChatResponse;
import com.optivise.model.ChatMessage;
import com.optivise.model.User;
import com.optivise.repository.ChatMessageRepository;
import com.optivise.repository.MetricSnapshotRepository;
import com.optivise.repository.UserRepository;
import com.optivise.service.ClaudeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageRepository chatRepo;
    private final UserRepository userRepo;
    private final ClaudeService claude;
    private final MetricSnapshotRepository metricRepo;

    @GetMapping
    public ResponseEntity<List<ChatMessageDTO>> getHistory(Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(
            chatRepo.findByShopOrderByCreatedAtAsc(user.getShopDomain())
                .stream().map(m -> ChatMessageDTO.builder()
                        .role(m.getRole()).content(m.getContent())
                        .createdAt(m.getCreatedAt()).build())
                .collect(Collectors.toList())
        );
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest req, Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        String shop = user.getShopDomain();

        chatRepo.save(ChatMessage.builder().shop(shop).role("user").content(req.getMessage()).build());

        var metrics = metricRepo.findLast30Days(shop);
        double totalRevenue = metrics.stream()
                .mapToDouble(m -> m.getTotalRevenue() != null ? m.getTotalRevenue() : 0).sum();
        double avgConversion = metrics.stream()
                .mapToDouble(m -> m.getConversionRate() != null ? m.getConversionRate() : 0)
                .average().orElse(0);
        String storeStats = "Total Revenue (30d): $%.0f | Avg Conversion: %.2f%% | Sessions/day: ~%s"
                .formatted(totalRevenue, avgConversion,
                        metrics.isEmpty() ? "2500" : metrics.get(0).getSessions());

        List<Map<String, String>> history = chatRepo.findRecentByShop(shop).stream()
                .map(m -> Map.of("role", m.getRole(), "content", m.getContent()))
                .collect(Collectors.toList());
        Collections.reverse(history);
        if (!history.isEmpty()) history = history.subList(0, history.size() - 1);

        String systemPrompt = claude.buildStoreSystemPrompt(user.getName(), storeStats);
        String reply = claude.chat(systemPrompt, history, req.getMessage());

        chatRepo.save(ChatMessage.builder().shop(shop).role("assistant").content(reply).build());
        return ResponseEntity.ok(ChatResponse.builder().reply(reply).build());
    }
}
