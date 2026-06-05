package com.optivise.service;

import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import com.optivise.repository.UserSettingsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WeeklyReportService {

    private static final Logger log = LoggerFactory.getLogger(WeeklyReportService.class);

    @Autowired private UserRepository userRepository;
    @Autowired private UserSettingsRepository settingsRepository;
    @Autowired private ShopifyService shopifyService;
    @Autowired private EmailService emailService;

    public void sendWeeklyReportsToAllUsers() {
        List<User> users = userRepository.findAll();
        log.info("Sending weekly reports to {} users", users.size());
        for (User user : users) {
            try {
                boolean hasStore = user.getShopDomain() != null && user.getShopifyAccessToken() != null
                        && !user.getShopDomain().isBlank()
                        && !user.getShopifyAccessToken().isBlank();
                if (!hasStore) continue;

                // Respect the user's weekly-report preference. Default to true if no
                // settings row exists yet (matches the UserSettings default).
                boolean wantsReport = settingsRepository.findByEmail(user.getEmail())
                        .map(s -> s.isWeeklyReport())
                        .orElse(true);
                if (!wantsReport) {
                    log.info("Skipping weekly report for {} (opted out)", user.getEmail());
                    continue;
                }

                sendReportToUser(user);
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
            // -- Fetch real Shopify data --
            List<Map<String, Object>> products = shopifyService.fetchProductsForUser(
                    user.getShopDomain(), user.getShopifyAccessToken()
            );
            List<Map<String, Object>> orders = shopifyService.fetchOrdersForUser(
                    user.getShopDomain(), user.getShopifyAccessToken()
            );

            // -- Real revenue & order count --
            double revenue = 0;
            for (Map<String, Object> order : orders) {
                Object total = order.get("total_price");
                if (total != null) {
                    try { revenue += Double.parseDouble(total.toString()); }
                    catch (Exception ignored) {}
                }
            }
            int orderCount = orders.size();

            // -- Top product by REAL revenue from order line items --
            Map<String, Double> revenueByProduct = new HashMap<>();
            for (Map<String, Object> order : orders) {
                Object lineItems = order.get("line_items");
                if (lineItems instanceof List) {
                    for (Object li : (List<?>) lineItems) {
                        if (li instanceof Map) {
                            Map<?, ?> item = (Map<?, ?>) li;
                            String title = item.get("title") != null ? item.get("title").toString() : null;
                            if (title == null) continue;
                            double linePrice = 0;
                            try {
                                double price = item.get("price") != null ? Double.parseDouble(item.get("price").toString()) : 0;
                                int qty = item.get("quantity") != null ? Integer.parseInt(item.get("quantity").toString()) : 1;
                                linePrice = price * qty;
                            } catch (Exception ignored) {}
                            revenueByProduct.merge(title, linePrice, Double::sum);
                        }
                    }
                }
            }
            String topProduct = "N/A";
            double topRevenue = 0;
            for (Map.Entry<String, Double> entry : revenueByProduct.entrySet()) {
                if (entry.getValue() > topRevenue) {
                    topRevenue = entry.getValue();
                    topProduct = entry.getKey();
                }
            }

            // -- Real count of products needing descriptions --
            long noDescCount = products.stream().filter(p -> {
                Object desc = p.get("body_html");
                return desc == null || desc.toString().isBlank();
            }).count();

            // -- Send honest email (no conversion rate, no fake losses, no A/B) --
            String userName = user.getName() != null ? user.getName().split(" ")[0] : "there";
            emailService.sendWeeklyReport(
                    user.getEmail(), userName,
                    user.getShopDomain(),
                    revenue, orderCount,
                    topProduct, topRevenue,
                    products.size(), noDescCount
            );

            log.info("Weekly report sent to {}", user.getEmail());

        } catch (Exception e) {
            log.error("Error building report for {}: {}", user.getEmail(), e.getMessage());
        }
    }
}