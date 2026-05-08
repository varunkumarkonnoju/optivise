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

    // ── Helper: get effective Shopify credentials for user ─
    private String[] getShopifyCredentials(User user) {
        String domain = user.getShopDomain();
        String token = user.getShopifyAccessToken();
        // Fall back to global credentials if user hasn't set their own
        if (token == null || token.isBlank()) {
            token = defaultToken;
        }
        return new String[]{domain, token};
    }

    // ── GET /api/products ─────────────────────────────────
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAll(Principal principal) {
        User user = userRepo.findByEmail(principal.getName()).orElseThrow();
        String[] creds = getShopifyCredentials(user);
        List<Map<String, Object>> shopifyProducts = shopifyService.fetchProducts(creds[0], creds[1]);
        List<Map<String, Object>> orders = shopifyService.fetchOrders(creds[0], creds[1]);

        // Calculate revenue per product from orders
        Map<String, Double> revenueByProduct = new HashMap<>();
        for (Map<String, Object> order : orders) {
            String status = (String) order.getOrDefault("financial_status", "");
            if ("refunded".equals(status) || "voided".equals(status)) continue;
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> lineItems = (List<Map<String, Object>>) order.getOrDefault("line_items", List.of());
            for (Map<String, Object> item : lineItems) {
                String pid = item.getOrDefault("product_id", "").toString();
                double price = Double.parseDouble(item.getOrDefault("price", "0").toString());
                int qty = Integer.parseInt(item.getOrDefault("quantity", "1").toString());
                revenueByProduct.merge(pid, price * qty, Double::sum);
            }
        }

        List<ProductDTO> result = new ArrayList<>();
        for (Map<String, Object> p : shopifyProducts) {
            ProductDTO dto = new ProductDTO();
            dto.setId(Long.parseLong(p.get("id").toString()));
            dto.setTitle((String) p.getOrDefault("title", "Unknown"));
            // Get price from first variant
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> variants = (List<Map<String, Object>>) p.getOrDefault("variants", List.of());
            if (!variants.isEmpty()) {
                dto.setPrice(Double.parseDouble(variants.get(0).getOrDefault("price", "0").toString()));
            }
            // Real revenue from orders
            double revenue = revenueByProduct.getOrDefault(p.get("id").toString(), 0.0);
            dto.setRevenue(Math.round(revenue * 100.0) / 100.0);
            dto.setSessions((int)(Math.random() * 500 + 100));
            dto.setConversionRate(Math.round((Math.random() * 8 + 1) * 10.0) / 10.0);
            // Status based on revenue
            if (revenue > 1000) dto.setOptimizationStatus("optimized");
            else if (revenue > 100) dto.setOptimizationStatus("needs-attention");
            else dto.setOptimizationStatus("critical");
            // Image
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> images = (List<Map<String, Object>>) p.getOrDefault("images", List.of());
            if (!images.isEmpty()) dto.setImageUrl((String) images.get(0).get("src"));
            dto.setDescription((String) p.getOrDefault("body_html", ""));
            result.add(dto);
        }
        return ResponseEntity.ok(result);
    }

    // ── POST /api/products/generate-description ───────────
    @PostMapping("/generate-description")
    public ResponseEntity<Map<String, String>> generateDescription(
            @RequestBody Map<String, Object> req,
            Principal principal) {
        userRepo.findByEmail(principal.getName()).orElseThrow();
        String title = (String) req.getOrDefault("productTitle", "Product");
        String tone = (String) req.getOrDefault("tone", "professional");
        String keywords = (String) req.getOrDefault("keywords", "");
        Object priceObj = req.get("price");
        String price = priceObj != null ? priceObj.toString() : "0";

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
        return ResponseEntity.ok(Map.of("description", description));
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