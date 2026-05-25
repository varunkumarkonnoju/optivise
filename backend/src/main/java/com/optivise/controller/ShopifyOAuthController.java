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
import java.security.Principal;

@RestController
@RequestMapping("/api/auth/shopify")
public class ShopifyOAuthController {

    @Autowired private UserRepository userRepo;
    @Autowired private JwtService jwtService;

    @Value("${shopify.oauth.client.id}")
    private String clientId;

    @Value("${shopify.oauth.client.key}")
    private String clientSecret;

    @Value("${shopify.oauth.redirect.uri:https://www.optiviseai.io/api/auth/shopify/callback}")
    private String redirectUri;

    private static final String SCOPES =
            "read_products,write_products,read_orders,read_customers,read_checkouts";

    // ── Step 1: Redirect to Shopify OAuth ────────────────
    // Accepts optional ?email= param so callback knows which user to update
    @GetMapping("/install")
    public ResponseEntity<?> install(
            @RequestParam String shop,
            @RequestParam(required = false) String email) {

        String cleanShop = shop.trim()
                .replace("https://", "").replace("http://", "").replace("/", "");
        if (!cleanShop.contains(".myshopify.com")) {
            cleanShop = cleanShop + ".myshopify.com";
        }

        // Encode email into state so callback can use it
        String statePayload = UUID.randomUUID().toString().replace("-", "");
        if (email != null && !email.isBlank()) {
            statePayload = statePayload + "|" + email;
        }

        String authUrl = "https://" + cleanShop + "/admin/oauth/authorize" +
                "?client_id=" + clientId +
                "&scope=" + URLEncoder.encode(SCOPES, StandardCharsets.UTF_8) +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                "&state=" + URLEncoder.encode(statePayload, StandardCharsets.UTF_8);

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

            // Extract email from state if present (format: "nonce|email")
            String emailFromState = null;
            if (state != null && state.contains("|")) {
                emailFromState = state.substring(state.indexOf("|") + 1);
            }

            User user = null;

            // 1. Try to find by email from state (logged-in user reconnecting)
            if (emailFromState != null && !emailFromState.isBlank()) {
                user = userRepo.findByEmail(emailFromState).orElse(null);
            }

            // 2. Try to find by shop domain
            if (user == null) {
                user = userRepo.findByShopDomain(shop).orElse(null);
            }

            // 3. Create new user if not found
            if (user == null) {
                user = new User();
                user.setName("Store Owner");
                user.setEmail(shop.replace(".myshopify.com", "") + "@optiviseai.io");
                user.setPassword("oauth_user_" + UUID.randomUUID());
                user.setRole("Store Owner");
                user.setPlan("free");
            }

            // Update store credentials
            user.setShopDomain(shop);
            user.setShopifyAccessToken(accessToken);
            userRepo.save(user);

            // Generate JWT and redirect
            String jwt = jwtService.generateToken(user.getEmail());
            String redirectUrl = "https://www.optiviseai.io/oauth/success?token=" + jwt +
                    "&shop=" + URLEncoder.encode(shop, StandardCharsets.UTF_8);

            return ResponseEntity.status(302)
                    .header("Location", redirectUrl)
                    .build();

        } catch (Exception e) {
            return ResponseEntity.status(302)
                    .header("Location", "https://www.optiviseai.io/login?error=oauth_failed")
                    .build();
        }
    }

    // ── POST /api/auth/shopify/disconnect ─────────────────
    @PostMapping("/disconnect")
    public ResponseEntity<?> disconnect(Principal principal) {
        try {
            Optional<User> userOpt = userRepo.findByEmail(principal.getName());
            if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

            User user = userOpt.get();
            user.setShopDomain(null);
            user.setShopifyAccessToken(null);
            userRepo.save(user);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Shopify store disconnected"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    private boolean verifyHmac(Map<String, String> params, String hmac) {
        try {
            List<String> pairs = new ArrayList<>();
            for (Map.Entry<String, String> entry : params.entrySet()) {
                if (!entry.getKey().equals("hmac")) {
                    pairs.add(entry.getKey() + "=" + entry.getValue());
                }
            }
            Collections.sort(pairs);
            String message = String.join("&", pairs);

            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    clientSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString().equals(hmac);
        } catch (Exception e) {
            return false;
        }
    }
}