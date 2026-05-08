package com.optivise.controller;

import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import com.optivise.service.ClaudeService;
import io.netty.resolver.DefaultAddressResolverGroup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.security.Principal;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marketing")
public class MarketingController {

    private static final Logger log = LoggerFactory.getLogger(MarketingController.class);

    @Autowired private ClaudeService claudeService;
    @Autowired private UserRepository userRepo;

    @Value("${openai.api.key}")
    private String openAiKey;

    private WebClient getClient() {
        return WebClient.builder()
                .baseUrl("https://api.openai.com")
                .clientConnector(new ReactorClientHttpConnector(
                        HttpClient.create()
                                .resolver(DefaultAddressResolverGroup.INSTANCE)
                                .responseTimeout(Duration.ofSeconds(60))
                ))
                .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
    }

    // ── Generate marketing copy ──────────────────────────
    @PostMapping("/generate")
    public ResponseEntity<?> generate(
            @RequestBody Map<String, String> req,
            Principal principal) {
        try {
            User user = userRepo.findByEmail(principal.getName()).orElseThrow();

// Block free plan users from image generation
            String plan = user.getPlan() != null ? user.getPlan() : "free";
            if (plan.equalsIgnoreCase("free") || plan.equalsIgnoreCase("starter")) {
                return ResponseEntity.status(403).body(Map.of(
                        "error",      "plan_required",
                        "message",    "AI Image generation is available on the Growth plan only.",
                        "upgradeUrl", "/pricing"
                ));
            }

            String type        = req.getOrDefault("type", "ad");
            String productName = req.getOrDefault("productName", "");
            String productDesc = req.getOrDefault("productDesc", "");
            String tone        = req.getOrDefault("tone", "professional");
            String platform    = req.getOrDefault("platform", "facebook");
            String audience    = req.getOrDefault("audience", "general shoppers");
            String cta         = req.getOrDefault("cta", "Shop Now");

            String prompt = buildPrompt(type, productName, productDesc,
                    tone, platform, audience, cta);
            String result = claudeService.chat(
                    "You are an expert marketing copywriter for e-commerce brands. " +
                            "Write compelling, conversion-focused marketing content. " +
                            "Be creative, specific and results-driven. No generic filler.",
                    List.of(), prompt
            );

            return ResponseEntity.ok(Map.of("result", result, "type", type));
        } catch (Exception e) {
            log.error("Marketing generate error: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Generate image with DALL-E 3 ─────────────────────
    @PostMapping("/generate-image")
    public ResponseEntity<?> generateImage(
            @RequestBody Map<String, String> req,
            Principal principal) {
        try {
            userRepo.findByEmail(principal.getName()).orElseThrow();

            String productName = req.getOrDefault("productName", "product");
            String style       = req.getOrDefault("style", "professional");
            String platform    = req.getOrDefault("platform", "instagram");
            String mood        = req.getOrDefault("mood", "vibrant");
            String bgColor     = req.getOrDefault("bgColor", "white");
            String size        = req.getOrDefault("size", "1024x1024");

            // Build DALL-E prompt based on style
            String imagePrompt = buildImagePrompt(
                    productName, style, platform, mood, bgColor);

            log.info("Generating image for product: {}, style: {}", productName, style);

            // Call DALL-E 3
            Map<String, Object> dalleRequest = Map.of(
                    "model",   "dall-e-3",
                    "prompt",  imagePrompt,
                    "n",       1,
                    "size",    size,
                    "quality", "hd",
                    "style",   style.equals("photorealistic") ? "natural" : "vivid"
            );

            Map response = getClient().post()
                    .uri("/v1/images/generations")
                    .header("Authorization", "Bearer " + openAiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(dalleRequest)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("data")) {
                var data = (java.util.List<?>) response.get("data");
                if (!data.isEmpty()) {
                    var imgData = (Map<?, ?>) data.get(0);
                    String imageUrl = (String) imgData.get("url");
                    String revisedPrompt = (String) imgData.get("revised_prompt");
                    return ResponseEntity.ok(Map.of(
                            "imageUrl",      imageUrl,
                            "revisedPrompt", revisedPrompt != null ? revisedPrompt : imagePrompt
                    ));
                }
            }
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "No image generated"));

        } catch (Exception e) {
            log.error("Image generation error: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Image generation failed: " + e.getMessage()));
        }
    }

    // ── Generate image variations prompt ─────────────────
    @PostMapping("/image-variations")
    public ResponseEntity<?> imageVariations(
            @RequestBody Map<String, String> req,
            Principal principal) {
        try {
            userRepo.findByEmail(principal.getName()).orElseThrow();

            String productName = req.getOrDefault("productName", "product");
            String baseStyle   = req.getOrDefault("style", "professional");

            // Generate 3 different prompts for variations
            String variationPrompt = String.format("""
                Generate 3 different DALL-E image prompt variations for marketing the product: %s
                Base style: %s
                
                Each variation should have a different visual approach.
                Format as:
                VARIATION 1: [prompt]
                VARIATION 2: [prompt]  
                VARIATION 3: [prompt]
                
                Each prompt should be specific, visual and suitable for %s marketing.
                """, productName, baseStyle, productName);

            String result = claudeService.chat(
                    "You are an expert at writing DALL-E image prompts for marketing.",
                    List.of(), variationPrompt
            );

            return ResponseEntity.ok(Map.of("variations", result));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    private String buildImagePrompt(String product, String style,
                                    String platform, String mood, String bgColor) {
        return switch (style) {
            case "lifestyle" -> String.format(
                    "Professional lifestyle product photography of %s. " +
                            "Aesthetic %s mood, natural lighting, beautiful %s background. " +
                            "Shot for %s marketing, high-end commercial photography, " +
                            "stunning composition, ultra-detailed, 8K quality.",
                    product, mood, bgColor, platform);

            case "minimalist" -> String.format(
                    "Ultra-clean minimalist product photo of %s. " +
                            "Pure %s background, centered composition, " +
                            "soft studio lighting, luxury brand aesthetic. " +
                            "Suitable for %s advertising, high-end e-commerce photography.",
                    product, bgColor, platform);

            case "bold" -> String.format(
                    "Bold, eye-catching marketing image for %s. " +
                            "Dynamic composition, vibrant colors, " +
                            "energetic %s mood. Perfect for %s ads, " +
                            "commercial photography, striking visual impact.",
                    product, mood, platform);

            case "photorealistic" -> String.format(
                    "Hyperrealistic product photography of %s. " +
                            "%s background, studio lighting setup, " +
                            "photorealistic rendering, professional e-commerce shot, " +
                            "commercial quality image for %s.",
                    product, bgColor, platform);

            case "artistic" -> String.format(
                    "Artistic creative marketing visual for %s. " +
                            "%s aesthetic, creative composition, " +
                            "premium brand feel, award-winning advertising photography. " +
                            "Designed for %s platform.",
                    product, mood, platform);

            default -> String.format(
                    "Professional product marketing image for %s. " +
                            "%s background, clean studio lighting. " +
                            "High quality commercial photography for %s advertising.",
                    product, bgColor, platform);
        };
    }

    private String buildPrompt(String type, String product, String desc,
                               String tone, String platform, String audience, String cta) {
        return switch (type) {
            case "ad" -> """
                Write a high-converting %s ad for:
                Product: %s
                Details: %s
                Target: %s | Tone: %s | CTA: %s

                HEADLINE: [max 40 chars, scroll-stopping]
                PRIMARY TEXT: [2-3 powerful sentences]
                DESCRIPTION: [1 sentence benefit]
                CTA: %s
                """.formatted(platform, product, desc, audience, tone, cta, cta);

            case "email" -> """
                Write a high-converting email campaign:
                Product: %s | Details: %s
                Tone: %s | Audience: %s

                SUBJECT LINE: [max 50 chars, high open rate]
                PREVIEW TEXT: [max 90 chars]
                HEADLINE: [email hero headline]
                BODY: [3 short paragraphs - problem, solution, proof]
                CTA BUTTON: [button text]
                P.S.: [powerful postscript]
                """.formatted(product, desc, tone, audience);

            case "social" -> """
                Write a viral %s post:
                Product: %s | Details: %s | Tone: %s

                CAPTION: [150-220 chars with 3-5 emojis]
                HOOK LINE: [first line that stops scrolling]
                HASHTAGS: [20 relevant hashtags]
                STORY TEXT: [max 80 chars for Stories]
                """.formatted(platform, product, desc, tone);

            case "blog" -> """
                Write an SEO blog post outline:
                Product: %s | Details: %s
                Tone: %s | Audience: %s

                TITLE: [SEO title with keyword]
                META DESCRIPTION: [150-160 chars]
                INTRODUCTION: [2-3 hook sentences]
                SECTION 1: [heading + description]
                SECTION 2: [heading + description]
                SECTION 3: [heading + description]
                SECTION 4: [heading + description]
                CONCLUSION: [closing with CTA]
                SEO KEYWORDS: [5 target keywords]
                """.formatted(product, desc, tone, audience);

            default -> "Write marketing content for: " + product;
        };
    }
}