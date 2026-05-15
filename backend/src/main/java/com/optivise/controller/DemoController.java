package com.optivise.controller;

import com.optivise.service.ClaudeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/demo")
public class DemoController {

    @Autowired
    private ClaudeService claudeService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateDescription(@RequestBody Map<String, String> body) {
        try {
            String productName = body.getOrDefault("productName", "").trim();
            if (productName.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Product name required"));
            }

            String prompt = """
                You are an expert Shopify product description writer. Generate a high-converting product description for: "%s"
                
                Respond with ONLY a JSON object in this exact format, no markdown, no extra text:
                {
                  "before": "A realistic weak description a typical store owner would write (1-2 sentences, basic and bland)",
                  "after": "<h2>Compelling Headline Here</h2><p>Engaging product description specific to this product.</p><ul><li>🌿 Specific benefit with emoji</li><li>✨ Second specific benefit with emoji</li><li>💯 Third specific benefit with emoji</li></ul><p><strong>🚚 Strong call to action here.</strong></p>",
                  "score": "+XX%% conversion predicted"
                }
                
                Make the before authentically bad. Make the after premium and specific to THIS exact product. Score between 28-45%%.
                """.formatted(productName);

            String result = claudeService.chat(
                    "You are an expert e-commerce copywriter. Always respond with valid JSON only.",
                    List.of(),
                    prompt
            );

            // Clean up response — remove markdown code blocks if present
            result = result.replaceAll("```json", "").replaceAll("```", "").trim();

            // Validate it looks like JSON
            if (!result.startsWith("{")) {
                int start = result.indexOf("{");
                int end = result.lastIndexOf("}");
                if (start >= 0 && end > start) {
                    result = result.substring(start, end + 1);
                }
            }

            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Generation failed: " + e.getMessage()));
        }
    }
}