package com.optivise.controller;

import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import com.optivise.service.ClaudeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marketing")
public class MarketingController {

    @Autowired private ClaudeService claudeService;
    @Autowired private UserRepository userRepo;

    @PostMapping("/generate")
    public ResponseEntity<?> generate(
            @RequestBody Map<String, String> req,
            Principal principal) {
        try {
            userRepo.findByEmail(principal.getName()).orElseThrow();

            String type        = req.getOrDefault("type", "ad");
            String productName = req.getOrDefault("productName", "");
            String productDesc = req.getOrDefault("productDesc", "");
            String tone        = req.getOrDefault("tone", "professional");
            String platform    = req.getOrDefault("platform", "facebook");
            String audience    = req.getOrDefault("audience", "general shoppers");
            String cta         = req.getOrDefault("cta", "Shop Now");

            String prompt = buildPrompt(type, productName, productDesc, tone, platform, audience, cta);

            String result = claudeService.chat(
                    "You are an expert marketing copywriter for e-commerce brands. " +
                            "Write compelling, conversion-focused marketing content. " +
                            "Be creative, engaging and specific. No generic filler content.",
                    List.of(),
                    prompt
            );

            return ResponseEntity.ok(Map.of("result", result, "type", type));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    private String buildPrompt(String type, String product, String desc,
                               String tone, String platform, String audience, String cta) {
        return switch (type) {
            case "ad" -> """
                Write a high-converting %s ad for this product:
                Product: %s
                Description: %s
                Target audience: %s
                Tone: %s
                CTA: %s

                Format your response as:
                HEADLINE: [compelling headline, max 40 chars]
                PRIMARY TEXT: [main ad copy, 2-3 sentences]
                CTA: %s

                Make it emotional, benefit-focused, and scroll-stopping.
                """.formatted(platform, product, desc, audience, tone, cta, cta);

            case "email" -> """
                Write an email campaign for this product:
                Product: %s
                Description: %s
                Tone: %s
                Target audience: %s

                Format your response as:
                SUBJECT LINE: [compelling subject, max 50 chars]
                PREVIEW TEXT: [preview text, max 90 chars]
                EMAIL BODY: [full email with greeting, body, and CTA button text]

                Make it personal, engaging and conversion-focused.
                """.formatted(product, desc, tone, audience);

            case "social" -> """
                Write a %s social media post for this product:
                Product: %s
                Description: %s
                Tone: %s

                Format your response as:
                CAPTION: [engaging caption with emojis, 150-220 chars]
                HASHTAGS: [15-20 relevant hashtags]
                STORY TEXT: [short punchy text for Instagram Story, max 80 chars]

                Make it viral-worthy and engaging.
                """.formatted(platform, product, desc, tone);

            case "blog" -> """
                Write a blog post outline for this product:
                Product: %s
                Description: %s
                Tone: %s
                Target audience: %s

                Format your response as:
                TITLE: [SEO-optimized blog title]
                META DESCRIPTION: [SEO meta description, 150-160 chars]
                INTRODUCTION: [2-3 engaging opening sentences]
                KEY SECTIONS:
                1. [Section heading + 2-sentence description]
                2. [Section heading + 2-sentence description]
                3. [Section heading + 2-sentence description]
                4. [Section heading + 2-sentence description]
                CONCLUSION: [Strong closing paragraph with CTA]

                Make it SEO-friendly and valuable to readers.
                """.formatted(product, desc, tone, audience);

            default -> "Write compelling marketing content for: " + product;
        };
    }
}