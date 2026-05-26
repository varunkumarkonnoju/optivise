package com.optivise.controller;

import com.optivise.dto.DashboardSummary;
import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import com.optivise.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired private DashboardService dashboardService;
    @Autowired private UserRepository userRepo;

    @Value("${shopify.store.access.token}")
    private String defaultToken;

    @GetMapping
    public ResponseEntity<DashboardSummary> getDashboard(Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        String shop = user.getShopDomain();
        String token = user.getShopifyAccessToken() != null && !user.getShopifyAccessToken().isBlank()
                ? user.getShopifyAccessToken() : defaultToken;

        // ── Return empty dashboard if no store connected ──
        if (shop == null || shop.isBlank()) {
            DashboardSummary empty = new DashboardSummary();
            empty.setTotalRevenue(0.0);
            empty.setRevenueDelta(0.0);
            empty.setConversionRate(0.0);
            empty.setConversionDelta(0.0);
            empty.setActiveAbTests(0);
            empty.setAbTestsDelta(0);
            empty.setAiSuggestions(0);
            empty.setAiSuggestionsNew(0);
            empty.setAiGrowthScore(0);
            empty.setGrowthLabel("Not connected");
            empty.setRevenueChart(List.of());
            empty.setTopProducts(List.of());
            empty.setRecommendedActions(List.of());
            return ResponseEntity.ok(empty);
        }

        return ResponseEntity.ok(dashboardService.getDashboard(shop, token));
    }
}