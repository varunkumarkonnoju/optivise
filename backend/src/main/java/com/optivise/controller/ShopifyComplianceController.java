package com.optivise.controller;

import com.optivise.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * Shopify mandatory GDPR/compliance webhooks. Required for every public app:
 *   - customers/data_request : a customer asks what data we hold
 *   - customers/redact       : a customer asks us to delete their data
 *   - shop/redact            : a shop is uninstalled; delete its data
 *
 * Shopify's reviewer sends test requests here and checks that we VERIFY the HMAC
 * and reject invalid ones with 401. All three topics post to this single endpoint;
 * we branch on the X-Shopify-Topic header.
 */
@RestController
@RequestMapping("/api/shopify/compliance")
public class ShopifyComplianceController {

    @Value("${shopify.oauth.client.key}")
    private String clientSecret;

    @Autowired
    private UserRepository userRepo;

    @PostMapping
    public ResponseEntity<String> handle(
            @RequestBody String payload,
            @RequestHeader(value = "X-Shopify-Hmac-Sha256", required = false) String hmacHeader,
            @RequestHeader(value = "X-Shopify-Topic", required = false) String topic,
            @RequestHeader(value = "X-Shopify-Shop-Domain", required = false) String shopDomain) {

        // 1. Verify the HMAC of the raw body. Reject anything unsigned/invalid with 401.
        if (hmacHeader == null || !verifyWebhookHmac(payload, hmacHeader)) {
            return ResponseEntity.status(401).body("Invalid HMAC");
        }

        // 2. Act on the request (only for shops we actually know).
        String t = topic != null ? topic : "";
        if (("shop/redact".equals(t) || "customers/redact".equals(t)) && shopDomain != null) {
            userRepo.findByShopDomain(shopDomain).ifPresent(u -> {
                u.setShopifyAccessToken(null);
                userRepo.save(u);
            });
        }
        // customers/data_request: Optivise stores no customer personal data of its own
        // it reads it live from Shopify, so there is nothing to compile and return.

        return ResponseEntity.ok("ok");
    }

    /** HMAC-SHA256 of the raw body, base64-encoded, compared to the header in constant time. */
    private boolean verifyWebhookHmac(String payload, String hmacHeader) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(clientSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computed = Base64.getEncoder().encodeToString(digest);
            return MessageDigest.isEqual(
                    computed.getBytes(StandardCharsets.UTF_8),
                    hmacHeader.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            return false;
        }
    }
}