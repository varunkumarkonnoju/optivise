package com.optivise.controller;

import com.optivise.model.Suggestion;
import com.optivise.model.User;
import com.optivise.model.UserSettings;
import com.optivise.repository.SuggestionRepository;
import com.optivise.repository.UserRepository;
import com.optivise.repository.UserSettingsRepository;
import com.optivise.service.ShopifyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {

    @Autowired private UserRepository userRepo;
    @Autowired private UserSettingsRepository settingsRepo;
    @Autowired private SuggestionRepository suggestionRepo;
    @Autowired private ShopifyService shopifyService;

    @Value("${shopify.store.access.token}")
    private String defaultToken;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getSuggestions(Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        UserSettings settings = settingsRepo.findByEmail(principal.getName()).orElse(new UserSettings());
        String shop = user.getShopDomain();
        String token = user.getShopifyAccessToken() != null && !user.getShopifyAccessToken().isBlank()
                ? user.getShopifyAccessToken() : defaultToken;

        try {
            checkAndSaveSuggestions(shop, token, settings);
        } catch (Exception e) {
            System.err.println("Failed to check suggestions: " + e.getMessage());
        }

        List<Suggestion> stored = suggestionRepo.findByShopAndDismissedFalseOrderByPriorityOrderDescCreatedAtDesc(shop);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Suggestion s : stored) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", s.getSuggestionKey());
            map.put("type", s.getType());
            map.put("priority", s.getPriority());
            map.put("title", s.getTitle());
            map.put("description", s.getDescription());
            map.put("impact", s.getImpact());
            map.put("effort", s.getEffort());
            map.put("action", s.getAction());
            map.put("actionLabel", s.getActionLabel());
            map.put("productId", s.getProductId());
            map.put("productTitle", s.getProductTitle());
            map.put("applied", s.isApplied());
            map.put("timestamp", s.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{key}")
    public ResponseEntity<?> dismiss(@PathVariable String key, Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        suggestionRepo.dismissByShopAndKey(user.getShopDomain(), key);
        return ResponseEntity.ok(Map.of("message", "dismissed"));
    }

    @PostMapping("/{key}/apply")
    public ResponseEntity<?> apply(@PathVariable String key, Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        suggestionRepo.applyByShopAndKey(user.getShopDomain(), key);
        return ResponseEntity.ok(Map.of("message", "applied"));
    }

    private void checkAndSaveSuggestions(String shop, String token, UserSettings settings) {
        List<Map<String, Object>> products = shopifyService.fetchProducts(shop, token);
        List<Map<String, Object>> orders = shopifyService.fetchOrders(shop, token);

        // Calculate real metrics
        double totalRevenue = 0;
        Map<String, Double> revenueByProduct = new HashMap<>();
        Map<String, String> productTitles = new HashMap<>();

        for (Map<String, Object> order : orders) {
            String status = (String) order.getOrDefault("financial_status", "");
            if ("refunded".equals(status) || "voided".equals(status)) continue;
            double total = Double.parseDouble(order.getOrDefault("total_price", "0").toString());
            totalRevenue += total;

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> lineItems = (List<Map<String, Object>>) order.getOrDefault("line_items", List.of());
            for (Map<String, Object> item : lineItems) {
                String pid = item.getOrDefault("product_id", "").toString();
                String title = (String) item.getOrDefault("title", "Product");
                double price = Double.parseDouble(item.getOrDefault("price", "0").toString());
                int qty = Integer.parseInt(item.getOrDefault("quantity", "1").toString());
                revenueByProduct.merge(pid, price * qty, Double::sum);
                productTitles.put(pid, title);
            }
        }

        double avgOrderValue = orders.isEmpty() ? 0 : totalRevenue / orders.size();

        // 1. Missing descriptions — HIGH priority
        for (Map<String, Object> product : products) {
            String body = (String) product.getOrDefault("body_html", "");
            if (body == null || body.trim().isEmpty()) {
                String pid = product.get("id").toString();
                String title = (String) product.getOrDefault("title", "Product");
                String key = "desc-" + pid;
                saveOrUpdate(shop, key, "description", "high", 100,
                        "Add AI description to \"" + title + "\"",
                        "This product has no description. Adding a compelling AI-generated description can increase conversions by up to 30%.",
                        "+15-30% conversion", "2 min", "generate_description", "Generate Description →",
                        pid, title);
            }
        }

        // 2. Low stock — HIGH priority
        for (Map<String, Object> product : products) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> variants = (List<Map<String, Object>>) product.getOrDefault("variants", List.of());
            for (Map<String, Object> variant : variants) {
                Object inv = variant.get("inventory_quantity");
                if (inv != null) {
                    int qty = Integer.parseInt(inv.toString());
                    if (qty >= 0 && qty <= 5) {
                        String pid = product.get("id").toString();
                        String title = (String) product.getOrDefault("title", "Product");
                        String key = "stock-" + pid;
                        saveOrUpdate(shop, key, "inventory", "high", 90,
                                "Low stock alert: \"" + title + "\"",
                                "Only " + qty + " units left. Restock soon to avoid losing sales.",
                                "Prevent lost sales", "5 min", "restock", "Restock Now →",
                                pid, title);
                    }
                }
            }
        }

        // 3. A/B test on best sellers — MEDIUM priority
        revenueByProduct.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(2)
                .forEach(entry -> {
                    String pid = entry.getKey();
                    String title = productTitles.getOrDefault(pid, "Product");
                    double rev = entry.getValue();
                    String key = "abtest-" + pid;
                    saveOrUpdate(shop, key, "abtesting", "medium", 70,
                            "Run A/B test on your best seller",
                            "\"" + title + "\" has generated $" + String.format("%.0f", rev) + " in revenue. Test a new description to maximize conversions.",
                            "+10-20% revenue", "5 min", "create_ab_test", "Create A/B Test →",
                            pid, title);
                });

        // 4. AOV with bundles — MEDIUM priority
        if (avgOrderValue > 0) {
            String key = "aov-bundles";
            saveOrUpdate(shop, key, "revenue", "medium", 60,
                    "Increase average order value with bundles",
                    "Your current AOV is $" + String.format("%.2f", avgOrderValue) + ". Creating product bundles can increase it by 20-40%.",
                    "+20-40% AOV", "15 min", "learn_more", "Ask AI Assistant →",
                    null, null);
        }

        // 5. AI store analysis — LOW priority
        saveOrUpdate(shop, "ai-analysis", "ai", "low", 40,
                "Get a full AI store analysis",
                "Ask the AI Assistant to analyze your store performance and identify hidden growth opportunities.",
                "Discover new opportunities", "2 min", "learn_more", "Ask AI Assistant →",
                null, null);

        // 6. Review weekly trends — LOW priority
        saveOrUpdate(shop, "weekly-trends", "revenue", "low", 30,
                "Review your weekly performance trends",
                "Check your analytics dashboard to spot revenue patterns and identify which days/times drive the most sales.",
                "Better insights", "5 min", "view_analytics", "View Analytics →",
                null, null);
    }

    private void saveOrUpdate(String shop, String key, String type, String priority, int priorityOrder,
                              String title, String description, String impact, String effort,
                              String action, String actionLabel, String productId, String productTitle) {
        Optional<Suggestion> existing = suggestionRepo.findByShopAndSuggestionKey(shop, key);
        if (existing.isPresent()) {
            // Update content but preserve timestamp
            Suggestion s = existing.get();
            s.setTitle(title);
            s.setDescription(description);
            suggestionRepo.save(s);
        } else {
            // New suggestion
            Suggestion s = new Suggestion();
            s.setShop(shop);
            s.setSuggestionKey(key);
            s.setType(type);
            s.setPriority(priority);
            s.setPriorityOrder(priorityOrder);
            s.setTitle(title);
            s.setDescription(description);
            s.setImpact(impact);
            s.setEffort(effort);
            s.setAction(action);
            s.setActionLabel(actionLabel);
            s.setProductId(productId);
            s.setProductTitle(productTitle);
            s.setCreatedAt(LocalDateTime.now());
            s.setDismissed(false);
            s.setApplied(false);
            suggestionRepo.save(s);
        }
    }
}