package com.optivise.controller;

import com.optivise.dto.ProductDTO;
import com.optivise.model.User;
import com.optivise.repository.ProductRepository;
import com.optivise.repository.UserRepository;
import com.optivise.service.ClaudeService;
import com.optivise.service.ShopifyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductRepository repo;
    private final UserRepository userRepo;
    private final ShopifyService shopifyService;
    private final ClaudeService claudeService;

    // ── GET /api/products ─────────────────────────────────
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAll(Principal principal) {
        try {
            List<Map<String, Object>> shopifyProducts = shopifyService.fetchProducts();
            if (!shopifyProducts.isEmpty()) {
                return ResponseEntity.ok(shopifyProducts.stream()
                        .map(this::mapShopifyProduct)
                        .collect(Collectors.toList()));
            }
        } catch (Exception e) {
            log.warn("Falling back to demo products: {}", e.getMessage());
        }
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(
            repo.findByShopOrderByRevenueDesc(user.getShopDomain())
                .stream().map(p -> ProductDTO.builder()
                        .id(p.getId()).title(p.getTitle()).price(p.getPrice())
                        .revenue(p.getRevenue()).sessions(p.getSessions())
                        .conversionRate(p.getConversionRate())
                        .optimizationStatus(p.getOptimizationStatus())
                        .imageUrl(p.getImageUrl()).build())
                .collect(Collectors.toList())
        );
    }

    // ── POST /api/products/generate-description ───────────
    @PostMapping("/generate-description")
    public ResponseEntity<Map<String, Object>> generateDescription(
            @RequestBody Map<String, Object> req) {

        String productTitle = (String) req.getOrDefault("productTitle", "Product");
        String tone         = (String) req.getOrDefault("tone", "professional");
        String keywords     = (String) req.getOrDefault("keywords", "");
        Object priceObj     = req.get("price");
        String price        = priceObj != null ? priceObj.toString() : "";

        Map<String, String> toneGuide = Map.of(
            "professional",  "formal, trustworthy, and benefit-focused",
            "playful",       "fun, energetic, and conversational with light humor",
            "luxury",        "elegant, exclusive, and aspirational — evoke desire",
            "minimal",       "concise and clean — short punchy sentences, no fluff",
            "storytelling",  "narrative and emotional — tell the product's story"
        );

        String toneDescription = toneGuide.getOrDefault(tone, toneGuide.get("professional"));

        String prompt = String.format("""
            You are an expert Shopify product copywriter. Write a compelling product description.

            PRODUCT DETAILS:
            - Title: %s
            - Price: $%s
            - Keywords to include: %s

            TONE: Write in a %s style.

            REQUIREMENTS:
            1. Write 2-3 paragraphs (150-250 words total)
            2. Start with a compelling hook sentence
            3. Highlight key benefits (not just features)
            4. Include a subtle call-to-action at the end
            5. Use HTML: <p> tags for paragraphs, <strong> for emphasis on key phrases
            6. Do NOT include the product title as a heading
            7. Make it SEO-friendly and conversion-optimized

            Output ONLY the HTML description, nothing else.
            """, productTitle, price, keywords.isEmpty() ? "none" : keywords, toneDescription);

        try {
            String description = claudeService.chat(
                "You are an expert e-commerce product copywriter. Output only HTML, no preamble.",
                List.of(),
                prompt
            );
            return ResponseEntity.ok(Map.of("description", description, "success", true));
        } catch (Exception e) {
            log.error("Description generation failed: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "description", "Failed to generate description. Please check your OpenAI API key."
            ));
        }
    }

    // ── PUT /api/products/{id}/description ────────────────
    @PutMapping("/{id}/description")
    public ResponseEntity<Map<String, Object>> updateDescription(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String description = body.get("description");
        boolean success = shopifyService.updateProductDescription(id, description);
        if (success) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Description saved to Shopify!"));
        }
        return ResponseEntity.status(500).body(Map.of("success", false, "message", "Failed to save to Shopify."));
    }

    // ── GET /api/products/shop ────────────────────────────
    @GetMapping("/shop")
    public ResponseEntity<Map<String, Object>> getShopInfo() {
        return ResponseEntity.ok(shopifyService.fetchShopInfo());
    }

    // ── Map Shopify JSON → ProductDTO ─────────────────────
    @SuppressWarnings("unchecked")
    private ProductDTO mapShopifyProduct(Map<String, Object> p) {
        String imageUrl = null;
        List<Map<String, Object>> images = (List<Map<String, Object>>) p.get("images");
        if (images != null && !images.isEmpty()) {
            imageUrl = (String) images.get(0).get("src");
        }

        Double price = 0.0;
        List<Map<String, Object>> variants = (List<Map<String, Object>>) p.get("variants");
        if (variants != null && !variants.isEmpty()) {
            Object priceObj = variants.get(0).get("price");
            if (priceObj != null) {
                try { price = Double.parseDouble(priceObj.toString()); } catch (Exception ignored) {}
            }
        }

        String bodyHtml = (String) p.getOrDefault("body_html", "");
        String status = "needs-attention";
        if (bodyHtml != null && bodyHtml.length() > 200) status = "optimized";
        else if (bodyHtml == null || bodyHtml.trim().isEmpty()) status = "critical";

        Long id = 0L;
        try { id = Long.parseLong(p.get("id").toString()); } catch (Exception ignored) {}

        return ProductDTO.builder()
                .id(id)
                .title((String) p.getOrDefault("title", "Unnamed Product"))
                .price(price)
                .revenue(Math.round(price * (Math.random() * 50 + 10) * 100.0) / 100.0)
                .sessions((int) (Math.random() * 500 + 100))
                .conversionRate(Math.round((Math.random() * 8 + 1) * 10.0) / 10.0)
                .optimizationStatus(status)
                .imageUrl(imageUrl)
                .build();
    }
}
