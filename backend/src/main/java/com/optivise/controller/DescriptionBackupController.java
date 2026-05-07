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

@RestController
@RequestMapping("/api/descriptions")
public class DescriptionBackupController {

    private static final Logger log = LoggerFactory.getLogger(DescriptionBackupController.class);

    @Autowired private DescriptionBackupRepository backupRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private ShopifyService shopifyService;

    // ── GET all backups for current store ───────────────────
    @GetMapping("/backups")
    public ResponseEntity<?> getBackups(Authentication auth) {
        try {
            Optional<User> userOpt = userRepo.findByEmail(auth.getName());
            if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

            User user = userOpt.get();
            if (user.getShopDomain() == null) {
                return ResponseEntity.ok(List.of());
            }

            List<DescriptionBackup> backups =
                    backupRepo.findByShopDomainAndRestoredFalseOrderBySavedAtDesc(
                            user.getShopDomain());

            return ResponseEntity.ok(backups);
        } catch (Exception e) {
            log.error("Failed to get backups: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // ── SAVE backup before AI description ───────────────────
    // Called automatically when AI description is saved to Shopify
    @PostMapping("/backup")
    public ResponseEntity<?> saveBackup(
            @RequestBody Map<String, String> request,
            Authentication auth) {
        try {
            Optional<User> userOpt = userRepo.findByEmail(auth.getName());
            if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

            User user = userOpt.get();
            String productId = request.get("productId");
            String productTitle = request.get("productTitle");
            String originalDescription = request.get("originalDescription");
            String aiDescription = request.get("aiDescription");

            // Check if backup already exists for this product
            Optional<DescriptionBackup> existing =
                    backupRepo.findByShopDomainAndProductId(
                            user.getShopDomain(), productId);

            if (existing.isPresent()) {
                // Update AI description but KEEP original (first backup = true original)
                DescriptionBackup backup = existing.get();
                backup.setAiDescription(aiDescription);
                backup.setRestored(false);
                backupRepo.save(backup);
            } else {
                // First time — save original description
                DescriptionBackup backup = new DescriptionBackup(
                        user.getShopDomain(),
                        productId,
                        productTitle,
                        originalDescription,
                        aiDescription
                );
                backupRepo.save(backup);
            }

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("Failed to save backup: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // ── RESTORE original description ─────────────────────────
    @PostMapping("/restore/{productId}")
    public ResponseEntity<?> restoreOriginal(
            @PathVariable String productId,
            Authentication auth) {
        try {
            Optional<User> userOpt = userRepo.findByEmail(auth.getName());
            if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

            User user = userOpt.get();

            // Find the backup
            Optional<DescriptionBackup> backupOpt =
                    backupRepo.findByShopDomainAndProductId(
                            user.getShopDomain(), productId);

            if (backupOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "No backup found for this product"));
            }

            DescriptionBackup backup = backupOpt.get();
            String originalDesc = backup.getOriginalDescription();

            // Restore to Shopify
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
            log.error("Failed to restore description: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // ── GET backup for single product ────────────────────────
    @GetMapping("/backup/{productId}")
    public ResponseEntity<?> getProductBackup(
            @PathVariable String productId,
            Authentication auth) {
        try {
            Optional<User> userOpt = userRepo.findByEmail(auth.getName());
            if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

            User user = userOpt.get();
            Optional<DescriptionBackup> backup =
                    backupRepo.findByShopDomainAndProductId(
                            user.getShopDomain(), productId);

            return backup.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}