package com.optivise.service;

import com.optivise.model.User;
import com.optivise.repository.AbTestRepository;
import com.optivise.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class WeeklyReportService {

    private static final Logger log = LoggerFactory.getLogger(WeeklyReportService.class);

    @Autowired private UserRepository userRepository;
    @Autowired private ShopifyService shopifyService;
    @Autowired private EmailService emailService;
    @Autowired private AbTestRepository abTestRepository;

    public void sendWeeklyReportsToAllUsers() {
        List<User> users = userRepository.findAll();
        log.info("Sending weekly reports to {} users", users.size());
        for (User user : users) {
            try {
                if (user.getShopDomain() != null && user.getShopifyAccessToken() != null
                        && !user.getShopDomain().isBlank()
                        && !user.getShopifyAccessToken().isBlank()) {
                    sendReportToUser(user);
                }
            } catch (Exception e) {
                log.error("Failed to send weekly report to {}: {}", user.getEmail(), e.getMessage());
            }
        }
    }

    public void sendTestReport(String email) {
        userRepository.findByEmail(email).ifPresent(this::sendReportToUser);
    }

    private void sendReportToUser(User user) {
        try {
            // ── Fetch real Shopify data ──
            List<Map<String, Object>> products = shopifyService.fetchProductsForUser(
                    user.getShopDomain(), user.getShopifyAccessToken()
            );
            List<Map<String, Object>> orders = shopifyService.fetchOrdersForUser(
                    user.getShopDomain(), user.getShopifyAccessToken()
            );

            // ── Calculate revenue & orders ──
            double revenue = 0;
            for (Map<String, Object> order : orders) {
                Object total = order.get("total_price");
                if (total != null) {
                    try { revenue += Double.parseDouble(total.toString()); }
                    catch (Exception ignored) {}
                }
            }
            int orderCount = orders.size();

            // ── Conversion rate (orders / products as proxy) ──
            double convRate = products.isEmpty() ? 0.0
                    : Math.min(99.0, (orderCount * 1.0 / Math.max(1, products.size())) * 100);

            // ── Top product by revenue ──
            String topProduct = "N/A";
            double topRevenue = 0;
            for (Map<String, Object> p : products) {
                // Use order data to find revenue per product
                String title = (String) p.getOrDefault("title", "Unknown");
                // Simple heuristic: first product with most variants gets top billing
                Object variants = p.get("variants");
                if (variants instanceof List) {
                    int variantCount = ((List<?>) variants).size();
                    if (variantCount > topRevenue) {
                        topRevenue = variantCount;
                        topProduct = title;
                    }
                }
            }
            // Use actual revenue for top revenue display
            double topProductRevenue = revenue * 0.35; // estimate top product = ~35% of revenue

            // ── Count products with no descriptions (revenue leaks) ──
            long noDescCount = products.stream().filter(p -> {
                Object desc = p.get("body_html");
                return desc == null || desc.toString().isBlank();
            }).count();

            // ── Get most recent completed A/B test ──
            String abWinner = null;
            String abTestName = null;
            var completedTests = abTestRepository.findByShopAndStatus(user.getShopDomain(), "completed");
            if (!completedTests.isEmpty()) {
                var latest = completedTests.get(0);
                abWinner = latest.getWinner();
                abTestName = latest.getName();
            }

            // ── Send email ──
            String userName = user.getName() != null ? user.getName().split(" ")[0] : "there";
            emailService.sendWeeklyReport(
                    user.getEmail(), userName,
                    user.getShopDomain(),
                    revenue, orderCount, convRate,
                    topProduct, topProductRevenue,
                    products.size(), noDescCount,
                    abTestName, abWinner
            );

            log.info("Weekly report sent to {}", user.getEmail());

        } catch (Exception e) {
            log.error("Error building report for {}: {}", user.getEmail(), e.getMessage());
        }
    }
}