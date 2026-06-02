package com.optivise.controller;

import com.optivise.dto.ChatMessageDTO;
import com.optivise.dto.ChatRequest;
import com.optivise.dto.ChatResponse;
import com.optivise.model.ChatMessage;
import com.optivise.model.User;
import com.optivise.repository.ChatMessageRepository;
import com.optivise.repository.UserRepository;
import com.optivise.service.ClaudeService;
import com.optivise.service.ShopifyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired private ChatMessageRepository chatRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private ClaudeService claude;
    @Autowired private ShopifyService shopifyService;

    @Value("${shopify.store.access.token}")
    private String defaultToken;

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

    @DeleteMapping
    public ResponseEntity<?> clearHistory(Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        chatRepo.deleteByShop(user.getShopDomain());
        return ResponseEntity.ok(Map.of("message", "History cleared"));
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest req, Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        String shop = user.getShopDomain();
        String token = user.getShopifyAccessToken() != null && !user.getShopifyAccessToken().isBlank()
                ? user.getShopifyAccessToken() : defaultToken;

        // Save user message
        chatRepo.save(ChatMessage.builder().shop(shop).role("user").content(req.getMessage()).build());

        // Build real store context from Shopify
        String storeStats = buildRealStoreContext(shop, token);

        // Get chat history
        List<Map<String, String>> history = chatRepo.findRecentByShop(shop).stream()
                .map(m -> Map.of("role", m.getRole(), "content", m.getContent()))
                .collect(Collectors.toList());
        Collections.reverse(history);
        if (!history.isEmpty()) history = history.subList(0, history.size() - 1);

        String systemPrompt = buildSystemPrompt(user.getName(), shop, storeStats);
        String reply = claude.chat(systemPrompt, history, req.getMessage());

        chatRepo.save(ChatMessage.builder().shop(shop).role("assistant").content(reply).build());
        return ResponseEntity.ok(ChatResponse.builder().reply(reply).build());
    }

    private String buildRealStoreContext(String shop, String token) {
        try {
            List<Map<String, Object>> products = shopifyService.fetchProducts(shop, token);
            List<Map<String, Object>> orders = shopifyService.fetchOrders(shop, token);

            // Calculate real metrics
            double totalRevenue = 0;
            double thisWeekRevenue = 0;
            int thisWeekOrders = 0;
            String thisWeekStart = LocalDate.now().minusDays(7).format(DateTimeFormatter.ISO_LOCAL_DATE);

            Map<String, Double> revenueByProduct = new HashMap<>();
            Map<String, Integer> qtyByProduct = new HashMap<>();

            for (Map<String, Object> order : orders) {
                String status = (String) order.getOrDefault("financial_status", "");
                if ("refunded".equals(status) || "voided".equals(status)) continue;
                double total = Double.parseDouble(order.getOrDefault("total_price", "0").toString());
                totalRevenue += total;
                String createdAt = (String) order.getOrDefault("created_at", "");
                if (createdAt.compareTo(thisWeekStart) >= 0) {
                    thisWeekRevenue += total;
                    thisWeekOrders++;
                }
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> lineItems = (List<Map<String, Object>>) order.getOrDefault("line_items", List.of());
                for (Map<String, Object> item : lineItems) {
                    Object pidObj = item.get("product_id");
                    String pid = pidObj != null ? pidObj.toString() : "custom";
                    String title = (String) item.getOrDefault("title", "Unknown");
                    Object priceObj = item.get("price");
                    Object qtyObj = item.get("quantity");
                    double price = priceObj != null ? Double.parseDouble(priceObj.toString()) : 0.0;
                    int qty = qtyObj != null ? Integer.parseInt(qtyObj.toString()) : 1;
                    revenueByProduct.merge(pid + "|" + title, price * qty, Double::sum);
                    qtyByProduct.merge(pid + "|" + title, qty, Integer::sum);
                }
            }

            // Top 3 products by revenue
            List<String> topProducts = revenueByProduct.entrySet().stream()
                    .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                    .limit(3)
                    .map(e -> e.getKey().split("\\|")[1] + " ($" + String.format("%.0f", e.getValue()) + ")")
                    .collect(Collectors.toList());

            // Products without descriptions
            long noDesc = products.stream().filter(p -> {
                String body = (String) p.getOrDefault("body_html", "");
                return body == null || body.trim().isEmpty();
            }).count();

            double avgOrderValue = orders.isEmpty() ? 0 : totalRevenue / orders.size();

            return """
                Store: %s
                Total Products: %d
                Total Orders: %d
                Total Revenue (all time): $%.2f
                This Week Revenue: $%.2f
                This Week Orders: %d
                Average Order Value: $%.2f
                Top Products by Revenue: %s
                Products Missing Descriptions: %d
                """.formatted(
                    shop,
                    products.size(),
                    orders.size(),
                    totalRevenue,
                    thisWeekRevenue,
                    thisWeekOrders,
                    avgOrderValue,
                    topProducts.isEmpty() ? "No data yet" : String.join(", ", topProducts),
                    noDesc
            );
        } catch (Exception e) {
            return "Store: " + shop + " (data loading error: " + e.getMessage() + ")";
        }
    }

    private String buildSystemPrompt(String ownerName, String shop, String storeStats) {
        return """
            You are an expert AI growth assistant for Optivise, helping Shopify store owner %s optimize their store at %s.

            Here is their REAL store data:
            %s

            IMPORTANT — what you DO and DO NOT have access to:
            - You HAVE: products, orders, revenue, average order value, top products by revenue, and which products are missing descriptions.
            - You DO NOT have: website traffic, visitor counts, sessions, conversion rate, ad data, or detailed week-over-week history beyond the figures shown above.
            - If the user asks about conversion rate, traffic, visitors, ad performance, or precise sales-trend causes, honestly tell them you don't have that data (Shopify's API doesn't reliably expose it), and offer what you CAN help with instead. Never invent or estimate numbers you were not given.

            Your role:
            - Answer questions using ONLY the real data above.
            - Give specific, actionable recommendations based on their actual metrics.
            - Help optimize products, descriptions, and revenue using the data you have.
            - Be concise, friendly, and data-driven.
            - Reference specific numbers from their real store data when relevant.
            - Use bullet points when listing multiple items.
            - Keep a warm, encouraging tone with a few relevant emojis (🚀 💰 📈 ✅).

            Never make up data, numbers, or trends. If you don't have the data to answer, say so honestly.
            """.formatted(ownerName, shop, storeStats);
    }
}