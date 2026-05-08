package com.optivise.controller;

import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/usage")
public class UsageController {

    @Autowired private UserRepository userRepo;

    // ── GET current usage stats ──────────────────────────
    @GetMapping
    public ResponseEntity<?> getUsage(Principal principal) {
        try {
            User user = userRepo.findByEmail(principal.getName()).orElseThrow();

            int used  = user.getUsageCount();
            int limit = user.getMonthlyLimit();
            String plan = user.getPlan() != null ? user.getPlan() : "free";
            boolean isUnlimited = plan.equalsIgnoreCase("growth");
            boolean hasReached  = user.hasReachedLimit();

            return ResponseEntity.ok(Map.of(
                    "used",        used,
                    "limit",       isUnlimited ? 999999 : limit,
                    "remaining",   isUnlimited ? 999999 : Math.max(0, limit - used),
                    "plan",        plan,
                    "isUnlimited", isUnlimited,
                    "hasReached",  hasReached,
                    "percentage",  isUnlimited ? 0 : Math.min(100, (used * 100) / limit)
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}