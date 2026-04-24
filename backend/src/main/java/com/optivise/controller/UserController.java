package com.optivise.controller;

import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired private UserRepository userRepo;

    // ── GET /api/users/me ─────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(Map.of(
                "id",         user.getId(),
                "name",       user.getName() != null ? user.getName() : "",
                "email",      user.getEmail() != null ? user.getEmail() : "",
                "shopDomain", user.getShopDomain() != null ? user.getShopDomain() : "",
                "role",       user.getRole() != null ? user.getRole() : "Store Owner",
                "plan",       user.getPlan() != null ? user.getPlan() : "free"
        ));
    }

    // ── PUT /api/users/me ─────────────────────────────────
    @PutMapping("/me")
    public ResponseEntity<Map<String, Object>> updateMe(
            @RequestBody Map<String, String> body,
            Principal principal) {
        try {
            User user = userRepo.findByEmail(principal.getName()).orElseThrow();

            // Update name if provided
            if (body.containsKey("name") && !body.get("name").isBlank()) {
                user.setName(body.get("name").trim());
            }

            // Update shop domain if provided
            if (body.containsKey("shopDomain") && !body.get("shopDomain").isBlank()) {
                String domain = body.get("shopDomain").trim()
                        .replace("https://", "").replace("http://", "").replace("/", "");
                if (!domain.contains(".myshopify.com")) {
                    domain = domain + ".myshopify.com";
                }
                user.setShopDomain(domain);
            }

            // Email change — check it's not taken by another user
            if (body.containsKey("email") && !body.get("email").isBlank()) {
                String newEmail = body.get("email").trim().toLowerCase();
                if (!newEmail.equals(user.getEmail())) {
                    if (userRepo.existsByEmail(newEmail)) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "Email already in use by another account"));
                    }
                    user.setEmail(newEmail);
                }
            }

            userRepo.save(user);

            return ResponseEntity.ok(Map.of(
                    "success", "true",
                    "name",       user.getName(),
                    "email",      user.getEmail(),
                    "shopDomain", user.getShopDomain() != null ? user.getShopDomain() : "",
                    "role",       user.getRole() != null ? user.getRole() : "Store Owner",
                    "plan",       user.getPlan() != null ? user.getPlan() : "free"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to update profile: " + e.getMessage()));
        }
    }
}