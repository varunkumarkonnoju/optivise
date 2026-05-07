package com.optivise.controller;

import com.optivise.model.DescriptionBackup;
import com.optivise.model.User;
import com.optivise.repository.DescriptionBackupRepository;
import com.optivise.repository.UserRepository;
import com.optivise.service.ShopifyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/descriptions")
public class DescriptionBackupController {

    private static final Logger log = LoggerFactory.getLogger(DescriptionBackupController.class);

    @Autowired private DescriptionBackupRepository backupRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private ShopifyService shopifyService;

    // ── GET all backups for current user ────────────────────
    @GetMapping("/backups")
    public ResponseEntity<?> getBackups(Authentication auth) {
        try {
            String email = auth.getName();
            log.info("Fetching backups for user: {}", email);

            Optional<User> userOpt = userRepo.findByEmail(email);
            if (userOpt.isEmpty()) {
                log.warn("User not found: {}", email);
                return ResponseEntity.status(401).build();
            }

            User user = userOpt.get();
            log.info("User shopDomain: {}", user.getShopDomain());

            // Fetch ALL backups, filter in memory — avoids JPA null issues
            List<DescriptionBackup> all = backupRepo.findAll();
            log.info("Total backups in DB: {}", all.size());

            List<DescriptionBackup> filtered = all.stream()
                    .filter(b -> {
                        // Match by shopDomain if both present
                        if (user.getShopDomain() != null && b.getShopDomain() != null) {
                            return user.getShopDomain().equals(b.getShopDomain());
                        }
                        // Fallback: match by email stored in shopDomain field
                        return email.equals(b.getShopDomain());
                    })
                    .sorted((a, b2) -> {
                        if (a.getSavedAt() == null) return 1;
                        if (b2.getSavedAt() == null) return -1;
                        return b2.getSavedAt().compareTo(a.getSavedAt());
                    })
                    .collect(Collectors.toList());

            log.info("Filtered backups for user: {}", filtered.size());
            return ResponseEntity.ok(filtered);

        } catch (Exception e) {
            log.error("Failed to get backups: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── SAVE backup before AI description ───────────────────
    @PostMapping("/backup")
    public ResponseEntity<?> saveBackup(
            @RequestBody Map<String, String> request,
            Authentication auth) {
        try {
            String email = auth.getName();
            Optional<User> userOpt = userRepo.findByEmail(email);
            if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

            User user = userOpt.get();
            String productId = request.get("productId");
            String productTitle = request.get("productTitle");
            String originalDescription = request.get("originalDescription");
            String aiDescription = request.get("aiDescription");

            // Use shopDomain if available, fallback to email
            String shopKey = user.getShopDomain() != null
                    ? user.getShopDomain()
                    : email;

            log.info("Saving backup for shop: {}, product: {}", shopKey, productId);

            // Check if backup already exists
            Optional<DescriptionBackup> existing =
                    backupRepo.findByShopDomainAndProductId(shopKey, productId);

            if (existing.isPresent()) {
                // Update AI description but KEEP the original (never overwrite original)
                DescriptionBackup backup = existing.get();
                backup.setAiDescription(aiDescription);
                backup.setRestored(false);
                backupRepo.save(backup);
                log.info("Updated existing backup for product: {}", productId);
            } else {
                // First time — save original description
                DescriptionBackup backup = new DescriptionBackup(
                        shopKey,
                        productId,
                        productTitle,
                        originalDescription,
                        aiDescription
                );
                backupRepo.save(backup);
                log.info("Created new backup for product: {}", productId);
            }

            return ResponseEntity.ok(Map.of("success", true));

        } catch (Exception e) {
            log.error("Failed to save backup: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── RESTORE original description ─────────────────────────
    @PostMapping("/restore/{productId}")
    public ResponseEntity<?> restoreOriginal(
            @PathVariable String productId,
            Authentication auth) {
        try {
            String email = auth.getName();
            Optional<User> userOpt = userRepo.findByEmail(email);
            if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

            User user = userOpt.get();
            String shopKey = user.getShopDomain() != null
                    ? user.getShopDomain()
                    : email;

            Optional<DescriptionBackup> backupOpt =
                    backupRepo.findByShopDomainAndProductId(shopKey, productId);

            if (backupOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "No backup found for this product"));
            }

            DescriptionBackup backup = backupOpt.get();
            String originalDesc = backup.getOriginalDescription();

            boolean success = shopifyService.updateProductDescription(
                    user.getShopDomain(),
                    user.getShopifyAccessToken(),
                    productId,
                    originalDesc != null ? originalDesc : ""
            );

            if (success) {
                backup.setRestored(true);
                backupRepo.save(backup);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Original description restored successfully",
                        "originalDescription", originalDesc != null ? originalDesc : ""
                ));
            } else {
                return ResponseEntity.internalServerError()
                        .body(Map.of("error", "Failed to restore on Shopify"));
            }

        } catch (Exception e) {
            log.error("Failed to restore: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET backup for single product ────────────────────────
    @GetMapping("/backup/{productId}")
    public ResponseEntity<?> getProductBackup(
            @PathVariable String productId,
            Authentication auth) {
        try {
            String email = auth.getName();
            Optional<User> userOpt = userRepo.findByEmail(email);
            if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

            User user = userOpt.get();
            String shopKey = user.getShopDomain() != null
                    ? user.getShopDomain()
                    : email;

            Optional<DescriptionBackup> backup =
                    backupRepo.findByShopDomainAndProductId(shopKey, productId);

            return backup.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}