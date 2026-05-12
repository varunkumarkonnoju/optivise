package com.optivise.controller;

import com.optivise.dto.AbTestDTO;
import com.optivise.model.AbTest;
import com.optivise.model.User;
import com.optivise.repository.AbTestRepository;
import com.optivise.repository.UserRepository;
import com.optivise.service.ClaudeService;
import com.optivise.service.ShopifyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/abtests")
public class AbTestController {

    private static final Logger log = LoggerFactory.getLogger(AbTestController.class);
    private final Random random = new Random();

    @Autowired private AbTestRepository repo;
    @Autowired private UserRepository userRepo;
    @Autowired private ClaudeService claudeService;
    @Autowired private ShopifyService shopifyService;

    // ── GET all tests ────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<AbTestDTO>> getAll(Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(
                repo.findByShopOrderByStartedAtDesc(user.getShopDomain())
                        .stream().map(this::toDTO).collect(Collectors.toList())
        );
    }

    // ── CREATE test ──────────────────────────────────────
    @PostMapping
    public ResponseEntity<AbTestDTO> create(@RequestBody Map<String, String> req, Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();

        AbTest test = AbTest.builder()
                .shop(user.getShopDomain())
                .name(req.get("name"))
                .elementType(req.getOrDefault("elementType", "description"))
                .status("running")
                .variantALabel(req.getOrDefault("variantALabel", "Original"))
                .variantBLabel(req.getOrDefault("variantBLabel", "AI Version"))
                .variantADescription(req.get("variantADescription"))
                .variantBDescription(req.get("variantBDescription"))
                .productId(req.get("productId"))
                .productTitle(req.get("productTitle"))
                .variantAConversion(0.0).variantBConversion(0.0)
                .variantATraffic(50).variantBTraffic(50)
                .variantAOrders(0).variantBOrders(0)
                .significanceLevel(0.0)
                .targetDays(Integer.parseInt(req.getOrDefault("targetDays", "14")))
                .insight("Test just started — check back in 24 hours for initial data.")
                .build();

        return ResponseEntity.ok(toDTO(repo.save(test)));
    }

    // ── SIMULATE progress (called on page load for running tests) ──
    @PostMapping("/{id}/simulate")
    public ResponseEntity<AbTestDTO> simulate(@PathVariable Long id, Principal principal) {
        AbTest test = repo.findById(id).orElseThrow();
        if (!"running".equals(test.getStatus())) return ResponseEntity.ok(toDTO(test));

        long daysRunning = ChronoUnit.DAYS.between(
                test.getStartedAt() != null ? test.getStartedAt() : LocalDateTime.now(),
                LocalDateTime.now()
        );

        // Simulate realistic data growth over time
        // Variant A (original) baseline around store's avg conversion
        double baseConvA = 1.8 + (random.nextGaussian() * 0.3);
        double baseConvB = 2.4 + (random.nextGaussian() * 0.4); // AI usually better

        // Add some daily noise
        if (daysRunning > 0) {
            baseConvA += daysRunning * 0.05 + random.nextGaussian() * 0.1;
            baseConvB += daysRunning * 0.08 + random.nextGaussian() * 0.15;
        }

        // Traffic grows over time
        int baseTrafficPerDay = 45 + random.nextInt(30);
        int totalVisitors = (int)(baseTrafficPerDay * Math.max(1, daysRunning));
        int trafficA = (int)(totalVisitors * 0.5);
        int trafficB = totalVisitors - trafficA;

        // Orders
        int ordersA = (int)(trafficA * baseConvA / 100);
        int ordersB = (int)(trafficB * baseConvB / 100);

        // Actual conversion
        double convA = trafficA > 0 ? (ordersA * 100.0 / trafficA) : 0;
        double convB = trafficB > 0 ? (ordersB * 100.0 / trafficB) : 0;

        test.setVariantAConversion(Math.round(convA * 100.0) / 100.0);
        test.setVariantBConversion(Math.round(convB * 100.0) / 100.0);
        test.setVariantATraffic(trafficA);
        test.setVariantBTraffic(trafficB);
        test.setVariantAOrders(ordersA);
        test.setVariantBOrders(ordersB);

        // Statistical significance (simplified)
        double significance = Math.min(99.9, daysRunning * 7.5 + totalVisitors * 0.02);
        test.setSignificanceLevel(Math.round(significance * 10.0) / 10.0);

        // Generate insight
        test.setInsight(generateInsight(test, daysRunning));

        // Auto-complete when significance >= 95 and enough data
        if (significance >= 95 && totalVisitors >= 500) {
            test.setStatus("completed");
            test.setEndedAt(LocalDateTime.now());
            test.setWinner(convB > convA ? test.getVariantBLabel() : test.getVariantALabel());
        }

        return ResponseEntity.ok(toDTO(repo.save(test)));
    }

    // ── APPLY winner to Shopify ───────────────────────────
    @PostMapping("/{id}/apply-winner")
    public ResponseEntity<?> applyWinner(@PathVariable Long id, Principal principal) {
        try {
            User user = userRepo.findByEmail(principal.getName()).orElseThrow();
            AbTest test = repo.findById(id).orElseThrow();

            if (test.getProductId() == null || test.getProductId().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No product linked to this test"));
            }

            // Determine winning description
            boolean bWins = test.getVariantBConversion() > test.getVariantAConversion();
            String winningDescription = bWins ? test.getVariantBDescription() : test.getVariantADescription();
            String winnerLabel = bWins ? test.getVariantBLabel() : test.getVariantALabel();

            if (winningDescription == null || winningDescription.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No description to apply"));
            }

            String token = user.getShopifyAccessToken();
            boolean success = shopifyService.updateProductDescription(
                    user.getShopDomain(), token, test.getProductId(), winningDescription
            );

            if (success) {
                test.setStatus("completed");
                test.setWinner(winnerLabel);
                test.setEndedAt(LocalDateTime.now());
                repo.save(test);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "✓ " + winnerLabel + " applied to Shopify!"
                ));
            }
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to update Shopify"));

        } catch (Exception e) {
            log.error("Apply winner error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── GENERATE AI insight ──────────────────────────────
    @PostMapping("/{id}/insight")
    public ResponseEntity<?> generateInsight(@PathVariable Long id, Principal principal) {
        try {
            userRepo.findByEmail(principal.getName()).orElseThrow();
            AbTest test = repo.findById(id).orElseThrow();

            String prompt = String.format("""
                Analyze this A/B test result for a Shopify store and provide a concise, actionable insight (2-3 sentences max):
                
                Test: %s
                Product: %s
                Variant A (%s): %.2f%% conversion rate, %d visitors, %d orders
                Variant B (%s): %.2f%% conversion rate, %d visitors, %d orders
                Statistical confidence: %.1f%%
                Days running: %d
                
                Be specific, data-driven and tell the store owner exactly what to do next.
                """,
                    test.getName(),
                    test.getProductTitle() != null ? test.getProductTitle() : "Unknown product",
                    test.getVariantALabel(), test.getVariantAConversion(),
                    test.getVariantATraffic(), test.getVariantAOrders(),
                    test.getVariantBLabel(), test.getVariantBConversion(),
                    test.getVariantBTraffic(), test.getVariantBOrders(),
                    test.getSignificanceLevel(),
                    ChronoUnit.DAYS.between(
                            test.getStartedAt() != null ? test.getStartedAt() : LocalDateTime.now(),
                            LocalDateTime.now()
                    )
            );

            String insight = claudeService.chat(
                    "You are an expert e-commerce conversion rate optimization specialist.",
                    List.of(), prompt
            );

            test.setInsight(insight);
            repo.save(test);
            return ResponseEntity.ok(Map.of("insight", insight));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── PAUSE ────────────────────────────────────────────
    @PutMapping("/{id}/pause")
    public ResponseEntity<AbTestDTO> pause(@PathVariable Long id) {
        AbTest test = repo.findById(id).orElseThrow();
        test.setStatus("paused");
        return ResponseEntity.ok(toDTO(repo.save(test)));
    }

    // ── RESUME ───────────────────────────────────────────
    @PutMapping("/{id}/resume")
    public ResponseEntity<AbTestDTO> resume(@PathVariable Long id) {
        AbTest test = repo.findById(id).orElseThrow();
        test.setStatus("running");
        return ResponseEntity.ok(toDTO(repo.save(test)));
    }

    // ── DELETE ───────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ── Helpers ──────────────────────────────────────────
    private String generateInsight(AbTest test, long days) {
        double convA = test.getVariantAConversion();
        double convB = test.getVariantBConversion();
        double sig = test.getSignificanceLevel();

        if (days == 0) return "Test just started — check back in 24 hours for initial data.";

        if (sig < 50) return String.format(
                "Early data: %s showing %.2f%% vs %s at %.2f%%. Need more traffic for reliable results.",
                test.getVariantALabel(), convA, test.getVariantBLabel(), convB
        );

        if (sig < 80) return String.format(
                "%s is leading with %.2f%% conversion vs %.2f%%. Confidence at %.0f%% — keep running.",
                convB > convA ? test.getVariantBLabel() : test.getVariantALabel(),
                Math.max(convA, convB), Math.min(convA, convB), sig
        );

        double uplift = convA > 0 ? ((convB - convA) / convA * 100) : 0;
        String leader = convB > convA ? test.getVariantBLabel() : test.getVariantALabel();

        if (sig >= 95) return String.format(
                "🏆 Clear winner: %s with %.2f%% conversion (+%.1f%% uplift). Confidence: %.0f%%. Apply winner now!",
                leader, Math.max(convA, convB), Math.abs(uplift), sig
        );

        return String.format(
                "%s is ahead (%.2f%% vs %.2f%%, %.0f%% confidence). Almost significant — keep test running.",
                leader, Math.max(convA, convB), Math.min(convA, convB), sig
        );
    }

    private AbTestDTO toDTO(AbTest t) {
        AbTestDTO d = new AbTestDTO();
        d.setId(t.getId()); d.setName(t.getName()); d.setStatus(t.getStatus());
        d.setElementType(t.getElementType());
        d.setVariantALabel(t.getVariantALabel()); d.setVariantBLabel(t.getVariantBLabel());
        d.setVariantADescription(t.getVariantADescription()); d.setVariantBDescription(t.getVariantBDescription());
        d.setVariantAConversion(t.getVariantAConversion()); d.setVariantBConversion(t.getVariantBConversion());
        d.setVariantATraffic(t.getVariantATraffic()); d.setVariantBTraffic(t.getVariantBTraffic());
        d.setVariantAOrders(t.getVariantAOrders()); d.setVariantBOrders(t.getVariantBOrders());
        d.setWinner(t.getWinner()); d.setInsight(t.getInsight());
        d.setProductId(t.getProductId()); d.setProductTitle(t.getProductTitle());
        d.setSignificanceLevel(t.getSignificanceLevel());
        d.setTargetDays(t.getTargetDays());
        d.setStartedAt(t.getStartedAt()); d.setEndedAt(t.getEndedAt());
        return d;
    }
}