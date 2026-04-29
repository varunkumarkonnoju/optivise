package com.optivise.controller;

import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import com.optivise.service.ClaudeService;
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
    @Autowired private ShopifyService shopifyService;
    @Autowired private ClaudeService claudeService;

    @Value("${shopify.store.access.token}")
    private String defaultToken;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getSuggestions(Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        String domain = user.getShopDomain();
        String token = user.getShopifyAccessToken() != null && !user.getShopifyAccessToken().isBlank()
                ? user.getShopifyAccessToken() : defaultToken;

        List<Map<String, Object>> suggestions = new ArrayList<>();

        try {
            List<Map<String, Object>> products = shopifyService.fetchProducts(domain, token);
            List<Map<String, Object>> orders = shopifyService.fetchOrders(domain, token);

            // Calculate revenue per product
            Map<String, Double> revenueByProduct = new HashMap<>();
            Map<String, Integer> ordersByProduct = new HashMap<>();
            for (Map<String, Object> order : orders) {
                String status = (String) order.getOrDefault("financial_status", "");
                if ("refunded".equals(status) || "voided".equals(status)) continue;
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> lineItems = (List<Map<String, Object>>) order.getOrDefault("line_items", List.of());
                for (Map<String, Object> item : lineItems) {
                    String pid = item.getOrDefault("product_id", "").toString();
                    double price = Double.parseDouble(item.getOrDefault("price", "0").toString());
                    int qty = Integer.parseInt(item.getOrDefault("quantity", "1").toString());
                    revenueByProduct.merge(pid, price * qty, Double::sum);
                    ordersByProduct.merge(pid, 1, Integer::sum);
                }
            }

            int suggestionId = 1;

            for (Map<String, Object> product : products) {
                String pid = product.get("id").toString();
                String title = (String) product.getOrDefault("title", "Unknown");
                String bodyHtml = (String) product.getOrDefault("body_html", "");
                double revenue = revenueByProduct.getOrDefault(pid, 0.0);

                @SuppressWarnings("unchecked")
                List<Map<String, Object>> variants = (List<Map<String, Object>>) product.getOrDefault("variants", List.of());
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> images = (List<Map<String, Object>>) product.getOrDefault("images", List.of());

                // No description
                if (bodyHtml == null || bodyHtml.trim().isEmpty()) {
                    Map<String, Object> s = new LinkedHashMap<>();
                    s.put("id", suggestionId++);
                    s.put("type", "description");
                    s.put("priority", "high");
                    s.put("title", "Add AI description to \"" + truncate(title, 40) + "\"");
                    s.put("description", "This product has no description. Adding a compelling AI-generated description can increase conversions by up to 30%.");
                    s.put("impact", "+15-30% conversion");
                    s.put("effort", "2 min");
                    s.put("productId", pid);
                    s.put("productTitle", title);
                    s.put("action", "generate_description");
                    s.put("actionLabel", "Generate Description");
                    s.put("applied", false);
                    suggestions.add(s);
                }

                // No images
                if (images.isEmpty()) {
                    Map<String, Object> s = new LinkedHashMap<>();
                    s.put("id", suggestionId++);
                    s.put("type", "image");
                    s.put("priority", "high");
                    s.put("title", "Add product images to \"" + truncate(title, 40) + "\"");
                    s.put("description", "Products without images get 75% fewer clicks. Add high-quality photos to boost visibility.");
                    s.put("impact", "+25% click rate");
                    s.put("effort", "10 min");
                    s.put("productId", pid);
                    s.put("productTitle", title);
                    s.put("action", "add_images");
                    s.put("actionLabel", "Go to Shopify");
                    s.put("applied", false);
                    suggestions.add(s);
                }

                // Low stock
                for (Map<String, Object> variant : variants) {
                    Object inv = variant.get("inventory_quantity");
                    if (inv != null && Integer.parseInt(inv.toString()) <= 3 && Integer.parseInt(inv.toString()) > 0) {
                        Map<String, Object> s = new LinkedHashMap<>();
                        s.put("id", suggestionId++);
                        s.put("type", "inventory");
                        s.put("priority", "high");
                        s.put("title", "Low stock alert: \"" + truncate(title, 35) + "\"");
                        s.put("description", "Only " + inv + " units left. Restock soon to avoid losing sales.");
                        s.put("impact", "Prevent lost sales");
                        s.put("effort", "5 min");
                        s.put("productId", pid);
                        s.put("productTitle", title);
                        s.put("action", "restock");
                        s.put("actionLabel", "Restock Now");
                        s.put("applied", false);
                        suggestions.add(s);
                        break;
                    }
                }

                // High revenue but no description — A/B test opportunity
                if (revenue > 500 && (bodyHtml == null || bodyHtml.length() < 100)) {
                    Map<String, Object> s = new LinkedHashMap<>();
                    s.put("id", suggestionId++);
                    s.put("type", "abtesting");
                    s.put("priority", "medium");
                    s.put("title", "Run A/B test on your best seller");
                    s.put("description", "\"" + truncate(title, 35) + "\" has generated $" + String.format("%.0f", revenue) + " in revenue. Test a new description to maximize conversions.");
                    s.put("impact", "+10-20% revenue");
                    s.put("effort", "5 min");
                    s.put("productId", pid);
                    s.put("productTitle", title);
                    s.put("action", "create_ab_test");
                    s.put("actionLabel", "Create A/B Test");
                    s.put("applied", false);
                    suggestions.add(s);
                }
            }

            // General recommendations based on store data
            if (orders.size() > 0 && products.size() > 0) {
                double totalRevenue = revenueByProduct.values().stream().mapToDouble(Double::doubleValue).sum();
                double avgOrderValue = totalRevenue / Math.max(orders.size(), 1);

                // Upsell suggestion
                Map<String, Object> s = new LinkedHashMap<>();
                s.put("id", suggestionId++);
                s.put("type", "revenue");
                s.put("priority", "medium");
                s.put("title", "Increase average order value with bundles");
                s.put("description", "Your current AOV is $" + String.format("%.2f", avgOrderValue) + ". Creating product bundles can increase it by 20-40%.");
                s.put("impact", "+20-40% AOV");
                s.put("effort", "15 min");
                s.put("action", "learn_more");
                s.put("actionLabel", "Ask AI Assistant");
                s.put("applied", false);
                suggestions.add(s);
            }

            // Add more smart recommendations



            // Recommendation: Ask AI for store analysis
            Map<String, Object> aiRec = new LinkedHashMap<>();
            aiRec.put("id", suggestionId++);
            aiRec.put("type", "ai");
            aiRec.put("priority", "low");
            aiRec.put("title", "Get a full AI store analysis");
            aiRec.put("description", "Ask the AI Assistant to analyze your store performance and identify hidden growth opportunities.");
            aiRec.put("impact", "Discover new opportunities");
            aiRec.put("effort", "2 min");
            aiRec.put("action", "learn_more");
            aiRec.put("actionLabel", "Ask AI Assistant");
            aiRec.put("applied", false);
            suggestions.add(aiRec);

            // Recommendation: Review analytics
            Map<String, Object> analyticsRec = new LinkedHashMap<>();
            analyticsRec.put("id", suggestionId++);
            analyticsRec.put("type", "revenue");
            analyticsRec.put("priority", "low");
            analyticsRec.put("title", "Review your weekly performance trends");
            analyticsRec.put("description", "Check your analytics dashboard to spot revenue patterns and identify which days/times drive the most sales.");
            analyticsRec.put("impact", "Better insights");
            analyticsRec.put("effort", "5 min");
            analyticsRec.put("action", "view_analytics");
            analyticsRec.put("actionLabel", "View Analytics");
            analyticsRec.put("applied", false);
            suggestions.add(analyticsRec);

            // Sort by priority
            // Add real timestamp to all suggestions
            String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM d, h:mm a"));
            suggestions.forEach(s -> s.put("timestamp", now));

            suggestions.sort((a, b) -> {
                Map<String, Integer> pri = Map.of("high", 0, "medium", 1, "low", 2);
                return pri.getOrDefault(a.get("priority"), 2) - pri.getOrDefault(b.get("priority"), 2);
            });

        } catch (Exception e) {
            Map<String, Object> s = new LinkedHashMap<>();
            s.put("id", 1);
            s.put("type", "info");
            s.put("priority", "high");
            s.put("title", "Connect your Shopify store to get recommendations");
            s.put("description", "Add your Shopify API token in Profile settings to get AI-powered recommendations.");
            s.put("impact", "Unlock all features");
            s.put("effort", "2 min");
            s.put("action", "connect_store");
            s.put("actionLabel", "Go to Profile");
            s.put("applied", false);
            suggestions.add(s);
        }

        return ResponseEntity.ok(suggestions);
    }

    private String truncate(String s, int max) {
        return s.length() > max ? s.substring(0, max) + "..." : s;
    }
}