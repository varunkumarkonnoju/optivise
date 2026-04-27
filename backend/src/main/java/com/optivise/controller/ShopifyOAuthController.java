package com.optivise.controller;

import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import com.optivise.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/auth/shopify")
public class ShopifyOAuthController {

    @Autowired private UserRepository userRepo;
    @Autowired private JwtService jwtService;

    @Value("${shopify.oauth.client.id}")
    private String clientId;

    @Value("${shopify.oauth.client.secret}")
    private String clientSecret;

    @Value("${shopify.oauth.redirect.uri:https://www.optiviseai.io/api/auth/shopify/callback}")
    private String redirectUri;

    private static final String SCOPES = "read_products,write_products,read_orders";

    // ── Step 1: Redirect to Shopify OAuth ────────────────
    @GetMapping("/install")
    public ResponseEntity<?> install(@RequestParam String shop) {
        // Clean shop domain
        String cleanShop = shop.trim()
                .replace("https://", "").replace("http://", "").replace("/", "");
        if (!cleanShop.contains(".myshopify.com")) {
            cleanShop = cleanShop + ".myshopify.com";
        }

        String nonce = UUID.randomUUID().toString().replace("-", "");
        String authUrl = "https://" + cleanShop + "/admin/oauth/authorize" +
                "?client_id=" + clientId +
                "&scope=" + URLEncoder.encode(SCOPES, StandardCharsets.UTF_8) +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                "&state=" + nonce;

        return ResponseEntity.ok(Map.of(
                "authUrl", authUrl,
                "shop", cleanShop
        ));
    }

    // ── Step 2: Handle OAuth callback ────────────────────
    @GetMapping("/callback")
    public ResponseEntity<?> callback(
            @RequestParam String code,
            @RequestParam String shop,
            @RequestParam String state,
            @RequestParam String hmac,
            @RequestParam Map<String, String> allParams) {

        // Verify HMAC
        if (!verifyHmac(allParams, hmac)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid HMAC"));
        }

        try {
            // Exchange code for access token
            String tokenUrl = "https://" + shop + "/admin/oauth/access_token";
            Map<String, String> tokenRequest = Map.of(
                    "client_id", clientId,
                    "client_secret", clientSecret,
                    "code", code
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> tokenResponse = WebClient.create()
                    .post().uri(tokenUrl)
                    .header("Content-Type", "application/json")
                    .bodyValue(tokenRequest)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            String accessToken = (String) tokenResponse.get("access_token");

            // Find or create user
            String shopDomain = shop;
            Optional<User> existingUser = userRepo.findByShopDomain(shopDomain);

            User user;
            if (existingUser.isPresent()) {
                user = existingUser.get();
                user.setShopifyAccessToken(accessToken);
                userRepo.save(user);
            } else {
                user = new User();
                user.setName("Store Owner");
                user.setEmail(shop.replace(".myshopify.com", "") + "@optiviseai.io");
                user.setPassword("oauth_user_" + UUID.randomUUID());
                user.setShopDomain(shopDomain);
                user.setShopifyAccessToken(accessToken);
                user.setRole("Store Owner");
                user.setPlan("free");
                userRepo.save(user);
            }

            // Generate JWT and redirect to dashboard
            String jwt = jwtService.generateToken(user.getEmail());
            String redirectUrl = "https://www.optiviseai.io/oauth/success?token=" + jwt +
                    "&shop=" + URLEncoder.encode(shopDomain, StandardCharsets.UTF_8);

            return ResponseEntity.status(302)
                    .header("Location", redirectUrl)
                    .build();

        } catch (Exception e) {
            return ResponseEntity.status(302)
                    .header("Location", "https://www.optiviseai.io/login?error=oauth_failed")
                    .build();
        }
    }

    private boolean verifyHmac(Map<String, String> params, String hmac) {
        try {
            // Build message excluding hmac param
            List<String> pairs = new ArrayList<>();
            for (Map.Entry<String, String> entry : params.entrySet()) {
                if (!entry.getKey().equals("hmac")) {
                    pairs.add(entry.getKey() + "=" + entry.getValue());
                }
            }
            Collections.sort(pairs);
            String message = String.join("&", pairs);

            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(clientSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString().equals(hmac);
        } catch (Exception e) {
            return false;
        }
    }
}