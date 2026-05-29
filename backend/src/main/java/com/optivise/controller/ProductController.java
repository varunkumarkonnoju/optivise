package com.optivise.controller;

import com.optivise.dto.ProductDTO;
import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import com.optivise.service.ClaudeService;
import com.optivise.service.ShopifyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired private ShopifyService shopifyService;
    @Autowired private ClaudeService claudeService;
    @Autowired private UserRepository userRepo;

    @Value("${shopify.store.access.token}")
    private String defaultToken;

    private String[] getShopifyCredentials(User user) {
        String domain = user.getShopDomain();
        String token  = user.getShopifyAccessToken();
        if (token == null || token.isBlank()) token = defaultToken;
        return new String[]{domain, token};
    }

    // ── GET /api/products ─────────────────────────────────
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAll(Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        String[] creds = getShopifyCredentials(user);
        List<Map<String, Object>> shopifyProducts = shopifyService.fetchProducts(creds[0], creds[1]);
        List<Map<String, Object>> orders = shopifyService.fetchOrders(creds[0], creds[1]);

        Map<String, Double> revenueByProduct = new HashMap<>();
        for (Map<String, Object> order : orders) {
            String status = (String) order.getOrDefault("financial_status", "");
            if ("refunded".equals(status) || "voided".equals(status)) continue;
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> lineItems = (List<Map<String, Object>>) order.getOrDefault("line_items", List.of());
            for (Map<String, Object> item : lineItems) {
                // Shopify custom line items have product_id: null — getOrDefault returns
                // null (not the default) when the key is present with a null value, so guard.
                Object pidObj = item.get("product_id");
                if (pidObj == null) continue; // skip non-catalog/custom line items
                String pid = pidObj.toString();
                Object priceObj = item.get("price");
                Object qtyObj = item.get("quantity");
                double price = priceObj != null ? Double.parseDouble(priceObj.toString()) : 0.0;
                int qty = qtyObj != null ? Integer.parseInt(qtyObj.toString()) : 1;
                revenueByProduct.merge(pid, price * qty, Double::sum);
            }
        }

        List<ProductDTO> result = new ArrayList<>();
        for (Map<String, Object> p : shopifyProducts) {
            try {
                ProductDTO dto = new ProductDTO();

                // BUG 15 FIX: null-safe id parsing
                Object idObj = p.getOrDefault("id", "0");
                dto.setId(Long.parseLong(idObj.toString()));

                dto.setTitle((String) p.getOrDefault("title", "Unknown"));

                @SuppressWarnings("unchecked")
                List<Map<String, Object>> variants = (List<Map<String, Object>>) p.getOrDefault("variants", List.of());
                if (!variants.isEmpty()) {
                    dto.setPrice(Double.parseDouble(variants.get(0).getOrDefault("price", "0").toString()));
                }

                double revenue = revenueByProduct.getOrDefault(p.get("id").toString(), 0.0);
                dto.setRevenue(Math.round(revenue * 100.0) / 100.0);

                // BUG 10 FIX: removed random sessions and conversion rate
                // Sessions and conversion rate require real analytics data
                // Setting to 0 until real data source is connected
                dto.setSessions(0);
                dto.setConversionRate(0.0);

                String descText = (p.getOrDefault("body_html", "")).toString().replaceAll("<[^>]*>", "").trim();
                boolean hasGoodDesc = descText.length() >= 100;
                if (revenue > 1000 && hasGoodDesc) dto.setOptimizationStatus("optimized");
                else if (revenue > 100 || hasGoodDesc) dto.setOptimizationStatus("needs-attention");
                else dto.setOptimizationStatus("critical");

                @SuppressWarnings("unchecked")
                List<Map<String, Object>> images = (List<Map<String, Object>>) p.getOrDefault("images", List.of());
                if (!images.isEmpty()) dto.setImageUrl((String) images.get(0).get("src"));

                dto.setDescription((String) p.getOrDefault("body_html", ""));
                result.add(dto);

            } catch (Exception e) {
                // BUG 15 FIX: skip malformed products instead of crashing entire endpoint
                System.err.println("Skipping malformed product: " + e.getMessage());
            }
        }
        return ResponseEntity.ok(result);
    }

    // ── POST /api/products/generate-description ───────────
    @PostMapping("/generate-description")
    public ResponseEntity<Map<String, Object>> generateDescription(
            @RequestBody Map<String, Object> req,
            Principal principal) {

        User user = userRepo.findByEmail(principal.getName()).orElseThrow();

        if (user.hasReachedLimit()) {
            String plan  = user.getPlan() != null ? user.getPlan() : "free";
            int limit    = user.getMonthlyLimit();
            int used     = user.getUsageCount();
            return ResponseEntity.status(429).body(Map.of(
                    "error",       "limit_reached",
                    "message",     "You've used all " + limit + " AI descriptions for this month.",
                    "used",        used,
                    "limit",       limit,
                    "plan",        plan,
                    "upgradeUrl",  "/pricing"
            ));
        }

        String title    = (String) req.getOrDefault("productTitle", "Product");
        String tone     = (String) req.getOrDefault("tone", "professional");
        String keywords = (String) req.getOrDefault("keywords", "");
        Object priceObj = req.get("price");
        String price    = priceObj != null ? priceObj.toString() : "0";

        String prompt = """
            Write a compelling, conversion-focused product description for an e-commerce store.
            Product: %s
            Price: $%s
            Tone: %s
            Keywords to include: %s

            Requirements:
            - Write in HTML format with proper tags (h2, p, ul, li)
            - 150-200 words
            - Focus on benefits not features
            - Include a subtle call to action
            - Make it SEO-friendly
            - Do not include markdown code fences
            """.formatted(title, price, tone, keywords.isEmpty() ? "none specified" : keywords);

        String description = claudeService.chat(
                "You are an expert e-commerce copywriter.",
                List.of(),
                prompt
        );

        user.incrementUsage();
        userRepo.save(user);

        return ResponseEntity.ok(Map.of(
                "description", description,
                "usage", Map.of(
                        "used",      user.getUsageCount(),
                        "limit",     user.getMonthlyLimit(),
                        "remaining", Math.max(0, user.getMonthlyLimit() - user.getUsageCount())
                )
        ));
    }

    // ── PUT /api/products/{id}/description ────────────────
    @PutMapping("/{id}/description")
    public ResponseEntity<Map<String, Object>> saveDescription(
            @PathVariable String id,
            @RequestBody Map<String, String> req,
            Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        String[] creds = getShopifyCredentials(user);
        String description = req.get("description");
        boolean success = shopifyService.updateProductDescription(creds[0], creds[1], id, description);
        return ResponseEntity.ok(Map.of("success", success));
    }
}