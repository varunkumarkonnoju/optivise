package com.optivise.service;

import com.optivise.dto.*;
import com.optivise.model.AbTest;
import com.optivise.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired private AiSuggestionRepository suggestionRepo;
    @Autowired private AbTestRepository abTestRepo;
    @Autowired private ShopifyService shopifyService;

    public DashboardSummary getDashboard(String shop, String token) {

        // ── Fetch real Shopify data ───────────────────────
        List<Map<String, Object>> ordersFetched   = new ArrayList<>();
        List<Map<String, Object>> productsFetched = new ArrayList<>();
        try {
            ordersFetched   = shopifyService.fetchOrders(shop, token);
            productsFetched = shopifyService.fetchProducts(shop, token);
        } catch (Exception e) {
            System.err.println("Shopify fetch failed: " + e.getMessage());
        }
        final List<Map<String, Object>> orders          = ordersFetched;
        final List<Map<String, Object>> shopifyProducts = productsFetched;

        // ── Calculate revenue from real orders ────────────
        double totalRevenue = 0;
        int    totalOrders  = 0;
        DateTimeFormatter labelFmt = DateTimeFormatter.ofPattern("MMM d");

        // Initialize last 30 days
        LinkedHashMap<String, Double>  revenueByDay     = new LinkedHashMap<>();
        LinkedHashMap<String, Integer> ordersByDay      = new LinkedHashMap<>();
        for (int i = 29; i >= 0; i--) {
            String key = LocalDate.now().minusDays(i).format(labelFmt);
            revenueByDay.put(key, 0.0);
            ordersByDay.put(key, 0);
        }

        Map<String, Double> revenueByProduct = new HashMap<>();

        for (Map<String, Object> order : orders) {
            try {
                String status = (String) order.getOrDefault("financial_status", "");
                if ("refunded".equals(status) || "voided".equals(status)) continue;

                double orderTotal = Double.parseDouble(order.getOrDefault("total_price", "0").toString());
                totalRevenue += orderTotal;
                totalOrders++;

                String createdAt = (String) order.getOrDefault("created_at", "");
                if (createdAt.length() >= 10) {
                    LocalDate date     = LocalDate.parse(createdAt.substring(0, 10));
                    String    dayLabel = date.format(labelFmt);
                    revenueByDay.computeIfPresent(dayLabel, (k, v) -> v + orderTotal);
                    ordersByDay.computeIfPresent(dayLabel, (k, v) -> v + 1);
                }

                @SuppressWarnings("unchecked")
                List<Map<String, Object>> lineItems =
                        (List<Map<String, Object>>) order.getOrDefault("line_items", new ArrayList<>());
                for (Map<String, Object> item : lineItems) {
                    String title = (String) item.getOrDefault("title", "Unknown");
                    double price = Double.parseDouble(item.getOrDefault("price", "0").toString());
                    int    qty   = Integer.parseInt(item.getOrDefault("quantity", "1").toString());
                    revenueByProduct.merge(title, price * qty, Double::sum);
                }
            } catch (Exception ignored) {}
        }

        // ── Conversion rate ───────────────────────────────
        // A real conversion rate needs sessions/visitors, which Shopify's API does not
        // reliably expose. Rather than fabricate it, we report 0 here and surface a real
        // metric (Average Order Value) on the dashboard instead.
        double conversionRate = 0;

        // ── Build chart data (no random values) ──────────
        List<MetricPoint> allChartData = revenueByDay.entrySet().stream().map(e -> {
            MetricPoint mp = new MetricPoint();
            mp.setLabel(e.getKey());
            mp.setRevenue(Math.round(e.getValue() * 100.0) / 100.0);
            // Conversion/sessions aren't tracked (no real sessions source); leave at 0.
            mp.setConversion(0.0);
            mp.setSessions(0L);
            return mp;
        }).collect(Collectors.toList());

        List<MetricPoint> chartDisplay = allChartData.size() > 8
                ? allChartData.subList(allChartData.size() - 8, allChartData.size())
                : allChartData;

        // ── Revenue delta (real: this week vs last week) ──
        double recentRev = allChartData.stream()
                .skip(Math.max(0, allChartData.size() - 7))
                .mapToDouble(MetricPoint::getRevenue).sum();
        double prevRev = allChartData.stream()
                .skip(Math.max(0, allChartData.size() - 14))
                .limit(7).mapToDouble(MetricPoint::getRevenue).sum();
        double revenueDelta = prevRev > 0
                ? Math.round(((recentRev - prevRev) / prevRev * 100) * 10.0) / 10.0
                : 0;

        // ── Top products (real revenue) ───────────────────
        List<ProductSummary> topProducts = new ArrayList<>();
        if (!revenueByProduct.isEmpty()) {
            revenueByProduct.entrySet().stream()
                    .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                    .limit(3)
                    .forEach(e -> {
                        ProductSummary ps = new ProductSummary();
                        ps.setId((long) Math.abs(e.getKey().hashCode()));
                        ps.setTitle(e.getKey());
                        ps.setRevenue(Math.round(e.getValue() * 100.0) / 100.0);
                        ps.setRevenueDelta(0.0); // real delta needs historical data
                        ps.setImageUrl(findProductImage(shopifyProducts, e.getKey()));
                        ps.setOptimizationStatus("needs-attention");
                        topProducts.add(ps);
                    });
        } else {
            shopifyProducts.stream().limit(3).forEach(p -> {
                ProductSummary ps = new ProductSummary();
                ps.setId(Long.parseLong(p.getOrDefault("id", "0").toString()));
                ps.setTitle((String) p.getOrDefault("title", "Product"));
                ps.setRevenue(0.0);
                ps.setRevenueDelta(0.0);
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> images = (List<Map<String, Object>>) p.get("images");
                if (images != null && !images.isEmpty()) {
                    ps.setImageUrl((String) images.get(0).get("src"));
                }
                ps.setOptimizationStatus("needs-attention");
                topProducts.add(ps);
            });
        }

        // ── Growth score (real) ───────────────────────────
        int    growthScore = calculateGrowthScore(totalRevenue, totalOrders);
        String growthLabel = growthScore >= 80 ? "Excellent"
                : growthScore >= 65 ? "Great"
                : growthScore >= 50 ? "Good"
                : "Needs Work";

        // ── Suggestions from real data ────────────────────
        List<SuggestionDTO> topSuggestions = new ArrayList<>();

        long noDescCount = shopifyProducts.stream().filter(p -> {
            String body = (String) p.getOrDefault("body_html", "");
            return body == null || body.trim().isEmpty() || body.replace("<[^>]*>", "").trim().length() < 50;
        }).count();

        if (noDescCount > 0) {
            SuggestionDTO s = new SuggestionDTO();
            s.setTitle("Add AI descriptions to " + noDescCount + " products");
            s.setDescription("Products missing descriptions have 30% lower conversion rates.");
            s.setImpact("High");
            s.setCategory("product");
            s.setApplied(false);
            topSuggestions.add(s);
        }

        double avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        if (avgOrderValue > 0) {
            SuggestionDTO s = new SuggestionDTO();
            s.setTitle("Increase AOV with product bundles");
            s.setDescription("Your current AOV is $" + String.format("%.2f", avgOrderValue) + ". Bundles can increase it by 20-40%.");
            s.setImpact("Medium");
            s.setCategory("revenue");
            s.setApplied(false);
            topSuggestions.add(s);
        }

        SuggestionDTO abSuggestion = new SuggestionDTO();
        abSuggestion.setTitle("Run an A/B test on your best seller");
        abSuggestion.setDescription("A/B testing product descriptions can increase conversions by 10-25%.");
        abSuggestion.setImpact("Medium");
        abSuggestion.setCategory("abtesting");
        abSuggestion.setApplied(false);
        topSuggestions.add(abSuggestion);

        // ── Active A/B tests ──────────────────────────────
        List<AbTest> activeTests = new ArrayList<>();
        try {
            activeTests = abTestRepo.findByShopAndStatus(shop, "running");
        } catch (Exception ignored) {}

        // ── Build response ────────────────────────────────
        DashboardSummary summary = new DashboardSummary();
        summary.setTotalRevenue(Math.round(totalRevenue * 100.0) / 100.0);
        summary.setRevenueDelta(revenueDelta);
        summary.setConversionRate(conversionRate);
        summary.setConversionDelta(0.0); // real delta needs historical data
        summary.setAvgOrderValue(Math.round(avgOrderValue * 100.0) / 100.0);
        summary.setActiveAbTests(activeTests.size());
        summary.setAbTestsDelta(0);
        summary.setAiSuggestions(topSuggestions.size());
        summary.setAiSuggestionsNew(Math.min(3, (int) noDescCount + 1));
        summary.setAiGrowthScore(growthScore);
        summary.setGrowthLabel(growthLabel);
        summary.setRevenueChart(chartDisplay);
        summary.setTopProducts(topProducts);
        summary.setRecommendedActions(topSuggestions);
        return summary;
    }

    private int calculateGrowthScore(double revenue, int orders) {
        int score = 42; // base
        if (revenue > 100000) score += 30;
        else if (revenue > 10000) score += 20;
        else if (revenue > 1000)  score += 12;
        else if (revenue > 100)   score += 5;
        if (orders > 500)  score += 15;
        else if (orders > 100) score += 10;
        else if (orders > 20)  score += 6;
        else if (orders > 5)   score += 3;
        return Math.min(score, 98);
    }

    @SuppressWarnings("unchecked")
    private String findProductImage(List<Map<String, Object>> products, String title) {
        for (Map<String, Object> p : products) {
            String pTitle = (String) p.getOrDefault("title", "");
            int matchLen = Math.min(4, pTitle.length());
            if (matchLen > 0 && title.toLowerCase().contains(pTitle.toLowerCase().substring(0, matchLen))) {
                List<Map<String, Object>> images = (List<Map<String, Object>>) p.get("images");
                if (images != null && !images.isEmpty()) {
                    return (String) images.get(0).get("src");
                }
            }
        }
        return null;
    }
}