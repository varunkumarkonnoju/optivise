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
        return ResponseEntity.ok(dashboardService.getDashboard(shop, token));
    }
}