package com.optivise.controller;

import com.optivise.model.Notification;
import com.optivise.model.User;
import com.optivise.model.UserSettings;
import com.optivise.repository.NotificationRepository;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired private UserRepository userRepo;
    @Autowired private UserSettingsRepository settingsRepo;
    @Autowired private NotificationRepository notifRepo;
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

        try {
            checkAndSaveNotifications(domain, token, settings);
        } catch (Exception e) {
            System.err.println("Failed to check notifications: " + e.getMessage());
        }

        List<Notification> stored = notifRepo.findByShopAndDismissedFalseOrderByCreatedAtDesc(domain);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Notification n : stored) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", n.getNotifId());
            map.put("type", n.getType());
            map.put("icon", n.getIcon());
            map.put("title", n.getTitle());
            map.put("message", n.getMessage());
            map.put("time", n.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            map.put("isNew", n.isNew());
            map.put("color", n.getColor());
            map.put("actionUrl", n.getActionUrl());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{notifId}")
    public ResponseEntity<?> dismiss(@PathVariable String notifId, Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        notifRepo.dismissByShopAndNotifId(user.getShopDomain(), notifId);
        return ResponseEntity.ok(Map.of("message", "dismissed"));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<?> markAllRead(Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        notifRepo.markAllReadByShop(user.getShopDomain());
        return ResponseEntity.ok(Map.of("message", "marked all read"));
    }

    private void checkAndSaveNotifications(String domain, String token, UserSettings settings) {
        List<Map<String, Object>> orders = shopifyService.fetchOrders(domain, token);
        List<Map<String, Object>> products = shopifyService.fetchProducts(domain, token);

        String today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        String yesterday = LocalDate.now().minusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE);
        String thisWeekStart = LocalDate.now().minusDays(7).format(DateTimeFormatter.ISO_LOCAL_DATE);

        double todayRevenue = 0, yesterdayRevenue = 0, weekRevenue = 0;
        int todayOrders = 0;
        Set<String> newCustomerEmails = new HashSet<>();

        for (Map<String, Object> order : orders) {
            String createdAt = (String) order.getOrDefault("created_at", "");
            String financial = (String) order.getOrDefault("financial_status", "");
            if ("refunded".equals(financial) || "voided".equals(financial)) continue;
            double total = Double.parseDouble(order.getOrDefault("total_price", "0").toString());

            if (createdAt.startsWith(today)) { todayRevenue += total; todayOrders++; }
            if (createdAt.startsWith(yesterday)) yesterdayRevenue += total;
            if (createdAt.compareTo(thisWeekStart) >= 0) weekRevenue += total;

            Object customerObj = order.get("customer");
            if (customerObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> customer = (Map<String, Object>) customerObj;
                String email = (String) customer.getOrDefault("email", "");
                if (!email.isEmpty() && createdAt.compareTo(thisWeekStart) >= 0) {
                    newCustomerEmails.add(email);
                }
            }
        }

        // New orders today
        if (settings.isNewOrderAlerts() && todayOrders > 0) {
            String key = "orders-" + today + "-" + todayOrders;
            saveOrUpdate(domain, key, "orders", "🛍️",
                    todayOrders + " new order" + (todayOrders > 1 ? "s" : "") + " today",
                    "Revenue today: $" + String.format("%.2f", todayRevenue),
                    true, "#6366F1", "/analytics");
        }

        // Low stock alerts
        if (settings.isLowStockAlerts()) {
            for (Map<String, Object> product : products) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> variants = (List<Map<String, Object>>) product.getOrDefault("variants", List.of());
                for (Map<String, Object> variant : variants) {
                    Object inv = variant.get("inventory_quantity");
                    if (inv != null) {
                        int qty = Integer.parseInt(inv.toString());
                        if (qty >= 0 && qty <= 5) {
                            String title = (String) product.getOrDefault("title", "Product");
                            String key = "low-stock-" + product.get("id");
                            saveOrUpdate(domain, key, "warning", "⚠️",
                                    "Low stock: \"" + title + "\"",
                                    "Only " + qty + " units left. Restock soon.",
                                    true, "#F59E0B", "/products");
                        }
                    }
                }
            }
        }

        // Revenue change
        if (yesterdayRevenue > 0) {
            double change = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
            String key = "revenue-" + today;
            String sign = change >= 0 ? "+" : "";
            saveOrUpdate(domain, key, "revenue", change >= 0 ? "📈" : "📉",
                    "Revenue " + (change >= 0 ? "up" : "down") + " " + sign + String.format("%.1f", change) + "% vs yesterday",
                    "Yesterday: $" + String.format("%.2f", yesterdayRevenue) + " → Today: $" + String.format("%.2f", todayRevenue),
                    change < -10, change >= 0 ? "#34D399" : "#F87171", "/analytics");
        }

        // Missing descriptions
        if (settings.isAiSuggestions()) {
            long noDescCount = products.stream().filter(p -> {
                String body = (String) p.getOrDefault("body_html", "");
                return body == null || body.trim().isEmpty();
            }).count();
            if (noDescCount > 0) {
                String key = "missing-desc-" + noDescCount;
                saveOrUpdate(domain, key, "ai", "✨",
                        noDescCount + " product" + (noDescCount > 1 ? "s" : "") + " missing AI descriptions",
                        "Add descriptions to boost conversions by up to 30%",
                        noDescCount > 2, "#818CF8", "/products");
            }
        }

        // New customers
        if (!newCustomerEmails.isEmpty()) {
            String key = "customers-" + thisWeekStart + "-" + newCustomerEmails.size();
            saveOrUpdate(domain, key, "customers", "👤",
                    newCustomerEmails.size() + " new customer" + (newCustomerEmails.size() > 1 ? "s" : "") + " this week",
                    "Growing your customer base! Keep it up.",
                    newCustomerEmails.size() > 3, "#06B6D4", "/analytics");
        }

        // Store health - daily summary
        String healthKey = "health-" + today;
        saveOrUpdate(domain, healthKey, "info", "✅",
                "Store health check complete",
                products.size() + " products · " + orders.size() + " total orders · $" + String.format("%.0f", weekRevenue) + " this week",
                false, "#06B6D4", "/analytics");
    }

    private void saveOrUpdate(String shop, String notifId, String type, String icon,
                              String title, String message, boolean isNew, String color, String actionUrl) {
        Optional<Notification> existing = notifRepo.findByShopAndNotifId(shop, notifId);
        Notification n = existing.orElseGet(Notification::new);
        n.setShop(shop);
        n.setNotifId(notifId);
        n.setType(type);
        n.setIcon(icon);
        n.setTitle(title);
        n.setMessage(message);
        n.setNew(isNew);
        n.setColor(color);
        n.setActionUrl(actionUrl);
        n.setCreatedAt(LocalDateTime.now());
        n.setDismissed(false);
        notifRepo.save(n);
    }
}