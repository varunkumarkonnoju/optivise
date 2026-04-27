package com.optivise.controller;

import com.optivise.dto.DashboardSummary;
import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import com.optivise.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepo;

    @GetMapping
    public ResponseEntity<DashboardSummary> getDashboard(Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }
}
