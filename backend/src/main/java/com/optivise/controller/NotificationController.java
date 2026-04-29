package com.optivise.controller;

import com.optivise.model.User;
import com.optivise.model.UserSettings;
import com.optivise.repository.UserRepository;
import com.optivise.repository.UserSettingsRepository;
import com.optivise.repository.AbTestRepository;
import com.optivise.service.ShopifyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired private UserRepository userRepo;
    @Autowired private UserSettingsRepository settingsRepo;
    @Autowired private ShopifyService shopifyService;
    @Autowired private AbTestRepository abTestRepo;

    @Value("${shopify.store.access.token}")
    private String defaultToken;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications(Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        UserSettings settings = settingsRepo.findByEmail(principal.getName()).orElse(new UserSettings());
        String domain = user.getShopDomain();
        String token = user.getShopifyAccessToken() != null && !user.getShopifyAccessToken().isBlank()
                ? user.getShopifyAccessToken() : defaultToken;

        List<Map<String, Object>> notifications = new ArrayList<>();

        try {
            List<Map<String, Object>> orders = shopifyService.fetchOrders(domain, token);
            // Limit to last 50 orders to save memory
            if (orders.size() > 50) orders = orders.subList(0, 50);
            List<Map<String, Object>> products = shopifyService.fetchProducts(domain, token);
            if (products.size() > 50) products = products.subList(0, 50);

            String today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
            String yesterday = LocalDate.now().minusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE);
            String thisWeekStart = LocalDate.now().minusDays(7).format(DateTimeFormatter.ISO_LOCAL_DATE);

            double todayRevenue = 0, yesterdayRevenue = 0, weekRevenue = 0, totalRevenue = 0;
            int todayOrders = 0, weekOrders = 0;
            int abandonedCarts = 0;
            Set<String> newCustomerEmails = new HashSet<>();

            for (Map<String, Object> order : orders) {
                String createdAt = (String) order.getOrDefault("created_at", "");
                String financial = (String) order.getOrDefault("financial_status", "");
                if ("refunded".equals(financial) || "voided".equals(financial)) continue;
                double total = Double.parseDouble(order.getOrDefault("total_price", "0").toString());
                totalRevenue += total;

                if (createdAt.startsWith(today)) { todayRevenue += total; todayOrders++; }
                if (createdAt.startsWith(yesterday)) yesterdayRevenue += total;
                if (createdAt.compareTo(thisWeekStart) >= 0) { weekRevenue += total; weekOrders++; }

                // Track new customers this week via orders
                Object customerObj = order.get("customer");
                if (customerObj instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> customer = (Map<String, Object>) customerObj;
                    String custEmail = (String) customer.getOrDefault("email", "");
                    if (!custEmail.isEmpty() && createdAt.compareTo(thisWeekStart) >= 0) {
                        newCustomerEmails.add(custEmail);
                    }
                }
            }

            // Count abandoned checkouts
            for (Map<String, Object> order : orders) {
                String status = (String) order.getOrDefault("financial_status", "");
                if ("pending".equals(status)) abandonedCarts++;
            }

            // ── 1. New orders today ───────────────────────────
            if (todayOrders > 0 && settings.isNewOrderAlerts()) {
                notifications.add(notif("orders-today", "orders", "🛍️",
                        todayOrders + " new order" + (todayOrders > 1 ? "s" : "") + " today",
                        "Revenue today: $" + String.format("%.2f", todayRevenue),
                        "Just now", true, "#6366F1", "/analytics"));
            } else {
                notifications.add(notif("no-orders-today", "info", "📊",
                        "No orders yet today",
                        "This week: " + weekOrders + " orders · $" + String.format("%.2f", weekRevenue),
                        "Just now", false, "#6366F1", "/analytics"));
            }

            // ── 2. Revenue change vs yesterday ────────────────
            if (yesterdayRevenue > 0 || todayRevenue > 0) {
                double change = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
                String sign = change >= 0 ? "+" : "";
                notifications.add(notif("revenue-change", "revenue", change >= 0 ? "📈" : "📉",
                        change == 0 ? "Revenue tracking active" : "Revenue " + (change >= 0 ? "up" : "down") + " " + sign + String.format("%.1f", change) + "% vs yesterday",
                        "Yesterday: $" + String.format("%.2f", yesterdayRevenue) + " → Today: $" + String.format("%.2f", todayRevenue),
                        "Just now", change < -10, change >= 0 ? "#34D399" : "#F87171", "/analytics"));
            }

            // ── 3. Revenue milestones ─────────────────────────
            long[] milestones = {1000, 5000, 10000, 25000, 50000, 100000};
            for (long milestone : milestones) {
                if (totalRevenue >= milestone && totalRevenue < milestone * 1.1) {
                    notifications.add(notif("milestone-" + milestone, "milestone", "🌟",
                            "🎉 Revenue milestone: $" + String.format("%,d", milestone) + " reached!",
                            "Total all-time revenue: $" + String.format("%.2f", totalRevenue),
                            "Achievement unlocked", true, "#F59E0B", "/analytics"));
                    break;
                }
            }

            // ── 4. Low stock alert ────────────────────────────
            int lowStockCount = 0;
            List<String> lowStockProducts = new ArrayList<>();
            for (Map<String, Object> product : products) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> variants = (List<Map<String, Object>>) product.getOrDefault("variants", List.of());
                for (Map<String, Object> variant : variants) {
                    Object inv = variant.get("inventory_quantity");
                    if (inv != null && Integer.parseInt(inv.toString()) <= 5 && Integer.parseInt(inv.toString()) >= 0) {
                        lowStockCount++;
                        if (lowStockProducts.size() < 2) lowStockProducts.add((String) product.getOrDefault("title", "Product"));
                    }
                }
            }
            if (lowStockCount > 0 && settings.isLowStockAlerts()) {
                notifications.add(notif("low-stock", "warning", "⚠️",
                        lowStockCount + " product" + (lowStockCount > 1 ? "s" : "") + " low on stock",
                        String.join(", ", lowStockProducts) + (lowStockCount > 2 ? " +" + (lowStockCount - 2) + " more" : ""),
                        "Just now", true, "#F59E0B", "/products"));
            }

            // ── 5. Missing descriptions ───────────────────────
            long noDescCount = products.stream().filter(p -> {
                String body = (String) p.getOrDefault("body_html", "");
                return body == null || body.trim().isEmpty();
            }).count();
            if (noDescCount > 0 && settings.isAiSuggestions()) {
                notifications.add(notif("missing-descriptions", "ai", "✨",
                        noDescCount + " product" + (noDescCount > 1 ? "s" : "") + " missing AI descriptions",
                        "Add descriptions to boost conversions by up to 30%",
                        "Just now", noDescCount > 2, "#818CF8", "/products"));
            }

            // ── 6. New customers this week ────────────────────
            if (!newCustomerEmails.isEmpty()) {
                notifications.add(notif("new-customers", "customers", "👤",
                        newCustomerEmails.size() + " new customer" + (newCustomerEmails.size() > 1 ? "s" : "") + " this week",
                        "Growing your customer base! Keep it up.",
                        "Just now", newCustomerEmails.size() > 3, "#06B6D4", "/analytics"));
            }

            // ── 7. Abandoned carts ────────────────────────────
            if (abandonedCarts > 0) {
                double recoveryPotential = abandonedCarts * (weekRevenue / Math.max(weekOrders, 1));
                notifications.add(notif("abandoned-carts", "warning", "🔄",
                        abandonedCarts + " pending order" + (abandonedCarts > 1 ? "s" : "") + " need attention",
                        "Potential recovery: $" + String.format("%.0f", recoveryPotential),
                        "Just now", true, "#F59E0B", "/analytics"));
            }

            // ── 8. A/B test winner ────────────────────────────
            try {
                abTestRepo.findByShopAndStatus(domain, "running").forEach(test -> {
                    double aConv = test.getVariantAConversion();
                    double bConv = test.getVariantBConversion();
                    double diff = Math.abs(aConv - bConv);
                    if (diff > 1.0 && test.getVariantATraffic() + test.getVariantBTraffic() > 100) {
                        String winner = bConv > aConv ? test.getVariantBLabel() : test.getVariantALabel();
                        notifications.add(notif("abtest-winner-" + test.getId(), "abtesting", "🎯",
                                "A/B test winner detected: " + test.getName(),
                                winner + " is winning with " + String.format("%.1f", diff) + "% higher conversion",
                                "Just now", true, "#6366F1", "/abtesting"));
                    }
                });
            } catch (Exception ignored) {}

            // ── 9. Store health ───────────────────────────────
            notifications.add(notif("store-health", "info", "✅",
                    "Store health check complete",
                    products.size() + " products · " + orders.size() + " total orders · $" + String.format("%.0f", weekRevenue) + " this week",
                    "Just now", false, "#06B6D4", "/analytics"));

        } catch (Exception e) {
            notifications.add(notif("connect-store", "info", "🔗",
                    "Connect your Shopify store",
                    "Click here to connect your store and see real notifications",
                    "Just now", true, "#6366F1", "/profile"));
        }

        return ResponseEntity.ok(notifications);
    }

    private Map<String, Object> notif(String id, String type, String icon, String title, String message, String time, boolean isNew, String color, String actionUrl) {
        Map<String, Object> n = new LinkedHashMap<>();
        n.put("id", id); n.put("type", type); n.put("icon", icon);
        n.put("title", title); n.put("message", message); n.put("time", time);
        n.put("isNew", isNew); n.put("color", color); n.put("actionUrl", actionUrl);
        return n;
    }
}