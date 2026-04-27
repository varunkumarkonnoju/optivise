package com.optivise.controller;

import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import com.optivise.service.ShopifyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired private UserRepository userRepo;
    @Autowired private ShopifyService shopifyService;

    @Value("${shopify.store.access.token}")
    private String defaultToken;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications(Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        String domain = user.getShopDomain();
        String token = user.getShopifyAccessToken() != null && !user.getShopifyAccessToken().isBlank()
                ? user.getShopifyAccessToken() : defaultToken;

        List<Map<String, Object>> notifications = new ArrayList<>();

        try {
            List<Map<String, Object>> orders = shopifyService.fetchOrders(domain, token);
            List<Map<String, Object>> products = shopifyService.fetchProducts(domain, token);

            String today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
            String yesterday = LocalDate.now().minusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE);
            String thisWeekStart = LocalDate.now().minusDays(7).format(DateTimeFormatter.ISO_LOCAL_DATE);

            // Count today's orders and revenue
            double todayRevenue = 0;
            double yesterdayRevenue = 0;
            double weekRevenue = 0;
            int todayOrders = 0;
            int weekOrders = 0;

            for (Map<String, Object> order : orders) {
                String createdAt = (String) order.getOrDefault("created_at", "");
                String financial = (String) order.getOrDefault("financial_status", "");
                if ("refunded".equals(financial) || "voided".equals(financial)) continue;
                double total = Double.parseDouble(order.getOrDefault("total_price", "0").toString());

                if (createdAt.startsWith(today)) {
                    todayRevenue += total;
                    todayOrders++;
                } else if (createdAt.startsWith(yesterday)) {
                    yesterdayRevenue += total;
                }
                if (createdAt.compareTo(thisWeekStart) >= 0) {
                    weekRevenue += total;
                    weekOrders++;
                }
            }

            // ── New orders today ─────────────────────────────────
            if (todayOrders > 0) {
                Map<String, Object> n = new LinkedHashMap<>();
                n.put("id", "orders-today");
                n.put("type", "orders");
                n.put("icon", "🛍️");
                n.put("title", todayOrders + " new order" + (todayOrders > 1 ? "s" : "") + " today");
                n.put("message", "Total revenue today: $" + String.format("%.2f", todayRevenue));
                n.put("time", "Just now");
                n.put("isNew", true);
                n.put("color", "#6366F1");
                n.put("actionUrl", "/analytics");
                notifications.add(n);
            } else {
                // No orders today
                Map<String, Object> n = new LinkedHashMap<>();
                n.put("id", "no-orders-today");
                n.put("type", "info");
                n.put("icon", "📊");
                n.put("title", "No orders yet today");
                n.put("message", "This week: " + weekOrders + " orders · $" + String.format("%.2f", weekRevenue));
                n.put("time", "Updated now");
                n.put("isNew", false);
                n.put("color", "#6366F1");
                n.put("actionUrl", "/analytics");
                notifications.add(n);
            }

            // ── Revenue change ────────────────────────────────────
            if (yesterdayRevenue > 0 || todayRevenue > 0) {
                double change = yesterdayRevenue > 0
                        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
                        : 0;
                String sign = change >= 0 ? "+" : "";
                Map<String, Object> n = new LinkedHashMap<>();
                n.put("id", "revenue-change");
                n.put("type", "revenue");
                n.put("icon", change >= 0 ? "📈" : "📉");
                n.put("title", change == 0
                        ? "Revenue tracking active"
                        : "Revenue " + (change >= 0 ? "up" : "down") + " " + sign + String.format("%.1f", change) + "% vs yesterday");
                n.put("message", "Yesterday: $" + String.format("%.2f", yesterdayRevenue) + " → Today: $" + String.format("%.2f", todayRevenue));
                n.put("time", "1h ago");
                n.put("isNew", change < -10);
                n.put("color", change >= 0 ? "#34D399" : "#F87171");
                n.put("actionUrl", "/analytics");
                notifications.add(n);
            }

            // ── Low stock alert ───────────────────────────────────
            int lowStockCount = 0;
            List<String> lowStockProducts = new ArrayList<>();
            for (Map<String, Object> product : products) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> variants = (List<Map<String, Object>>) product.getOrDefault("variants", List.of());
                for (Map<String, Object> variant : variants) {
                    Object inv = variant.get("inventory_quantity");
                    if (inv != null) {
                        int qty = Integer.parseInt(inv.toString());
                        if (qty >= 0 && qty <= 5) {
                            lowStockCount++;
                            if (lowStockProducts.size() < 2)
                                lowStockProducts.add((String) product.getOrDefault("title", "Product"));
                        }
                    }
                }
            }
            if (lowStockCount > 0) {
                Map<String, Object> n = new LinkedHashMap<>();
                n.put("id", "low-stock");
                n.put("type", "warning");
                n.put("icon", "⚠️");
                n.put("title", lowStockCount + " product" + (lowStockCount > 1 ? "s" : "") + " low on stock");
                n.put("message", String.join(", ", lowStockProducts) + (lowStockCount > 2 ? " and " + (lowStockCount - 2) + " more" : ""));
                n.put("time", "2h ago");
                n.put("isNew", true);
                n.put("color", "#F59E0B");
                n.put("actionUrl", "/products");
                notifications.add(n);
            }

            // ── Products without descriptions ─────────────────────
            long noDescCount = products.stream().filter(p -> {
                String body = (String) p.getOrDefault("body_html", "");
                return body == null || body.trim().isEmpty();
            }).count();

            if (noDescCount > 0) {
                Map<String, Object> n = new LinkedHashMap<>();
                n.put("id", "missing-descriptions");
                n.put("type", "ai");
                n.put("icon", "✨");
                n.put("title", noDescCount + " product" + (noDescCount > 1 ? "s" : "") + " missing AI descriptions");
                n.put("message", "Add descriptions to boost conversions by up to 30%");
                n.put("time", "3h ago");
                n.put("isNew", noDescCount > 2);
                n.put("color", "#818CF8");
                n.put("actionUrl", "/products");
                notifications.add(n);
            }

            // ── Store health ──────────────────────────────────────
            Map<String, Object> health = new LinkedHashMap<>();
            health.put("id", "store-health");
            health.put("type", "info");
            health.put("icon", "✅");
            health.put("title", "Store health check complete");
            health.put("message", products.size() + " products · " + orders.size() + " total orders · $" + String.format("%.0f", weekRevenue) + " this week");
            health.put("time", "5h ago");
            health.put("isNew", false);
            health.put("color", "#06B6D4");
            health.put("actionUrl", "/analytics");
            notifications.add(health);

        } catch (Exception e) {
            // Store not connected
            Map<String, Object> n = new LinkedHashMap<>();
            n.put("id", "connect-store");
            n.put("type", "info");
            n.put("icon", "🔗");
            n.put("title", "Connect your Shopify store");
            n.put("message", "Click here to connect your store and see real notifications");
            n.put("time", "Just now");
            n.put("isNew", true);
            n.put("color", "#6366F1");
            n.put("actionUrl", "/profile");
            notifications.add(n);
        }

        return ResponseEntity.ok(notifications);
    }
}