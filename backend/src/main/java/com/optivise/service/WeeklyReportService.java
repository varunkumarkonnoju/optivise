package com.optivise.service;

import com.optivise.model.User;
import com.optivise.repository.AbTestRepository;
import com.optivise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class WeeklyReportService {

    private static final Logger log = LoggerFactory.getLogger(WeeklyReportService.class);

    private final UserRepository userRepository;
    private final ShopifyService shopifyService;
    private final EmailService emailService;
    private final AbTestRepository abTestRepository;

    public void sendWeeklyReportsToAllUsers() {
        List<User> users = userRepository.findAll();
        log.info("Sending weekly reports to {} users", users.size());

        for (User user : users) {
            try {
                if (user.getShopDomain() != null && user.getShopifyAccessToken() != null
                        && !user.getShopDomain().isBlank() && !user.getShopifyAccessToken().isBlank()) {
                    sendReportToUser(user);
                }
            } catch (Exception e) {
                log.error("Failed to send weekly report to {}: {}", user.getEmail(), e.getMessage());
            }
        }
    }

    private void sendReportToUser(User user) {
        try {
            // Get dashboard data from Shopify
            Map<String, Object> dashboard = shopifyService.getDashboardData(
                    user.getShopDomain(), user.getShopifyAccessToken()
            );

            // Get products
            List<Map<String, Object>> products = shopifyService.getProducts(
                    user.getShopDomain(), user.getShopifyAccessToken()
            );

            // Get completed A/B tests this week
            var completedTests = abTestRepository
                    .findByShopAndStatus(user.getShopDomain(), "completed");

            // Extract key metrics
            double revenue = toDouble(dashboard.get("totalRevenue"));
            int orders     = toInt(dashboard.get("totalOrders"));
            double convRate = toDouble(dashboard.get("conversionRate"));
            int productCount = products != null ? products.size() : 0;

            // Find top product by revenue
            String topProduct = "N/A";
            double topRevenue = 0;
            if (products != null) {
                for (Map<String, Object> p : products) {
                    Object rev = p.get("revenue");
                    if (rev != null) {
                        double r = toDouble(rev);
                        if (r > topRevenue) {
                            topRevenue = r;
                            topProduct = (String) p.getOrDefault("title", "Unknown");
                        }
                    }
                }
            }

            // Count products with no descriptions (revenue leaks)
            long noDescCount = products == null ? 0 : products.stream()
                    .filter(p -> {
                        Object desc = p.get("description");
                        return desc == null || desc.toString().isBlank();
                    }).count();

            // Get most recent A/B test winner
            String abWinner = null;
            String abTestName = null;
            if (!completedTests.isEmpty()) {
                var latest = completedTests.get(0);
                abWinner = latest.getWinner();
                abTestName = latest.getName();
            }

            // Send email
            String userName = user.getName() != null ? user.getName().split(" ")[0] : "there";
            emailService.sendWeeklyReport(
                    user.getEmail(), userName,
                    user.getShopDomain(),
                    revenue, orders, convRate,
                    topProduct, topRevenue,
                    productCount, noDescCount,
                    abTestName, abWinner
            );

            log.info("Weekly report sent to {}", user.getEmail());

        } catch (Exception e) {
            log.error("Error building report for {}: {}", user.getEmail(), e.getMessage());
        }
    }

    // ── Send to a single user immediately (for testing) ──
    public void sendTestReport(String email) {
        userRepository.findByEmail(email).ifPresent(this::sendReportToUser);
    }

    private double toDouble(Object val) {
        if (val == null) return 0.0;
        if (val instanceof Number) return ((Number) val).doubleValue();
        try { return Double.parseDouble(val.toString()); } catch (Exception e) { return 0.0; }
    }

    private int toInt(Object val) {
        if (val == null) return 0;
        if (val instanceof Number) return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return 0; }
    }
}