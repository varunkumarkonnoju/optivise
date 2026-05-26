package com.optivise.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import com.optivise.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/auth/shopify")
public class ShopifyOAuthController {

    @Autowired private UserRepository userRepo;
    @Autowired private JwtService jwtService;
    @Autowired private PasswordEncoder passwordEncoder;

    @Value("${shopify.oauth.client.id}")
    private String clientId;

    @Value("${shopify.oauth.client.key}")
    private String clientSecret;

    @Value("${shopify.oauth.redirect.uri:https://www.optiviseai.io/auth/shopify/callback}")
    private String redirectUri;

    private static final String SCOPES =
            "read_products,write_products,read_orders,read_customers,read_checkouts";

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── Plain Java HTTP — bypasses Netty DNS issues ───────
    private Map<String, Object> exchangeCodeForToken(String shop, String code) throws Exception {
        String tokenUrl = "https://" + shop + "/admin/oauth/access_token";

        // Build JSON body
        String jsonBody = objectMapper.writeValueAsString(Map.of(
                "client_id", clientId,
                "client_secret", clientSecret,
                "code", code
        ));

        System.out.println("=== RESOLVING: " + shop);
        try {
            InetAddress addr = InetAddress.getByName(shop);
            System.out.println("=== RESOLVED TO: " + addr.getHostAddress());
        } catch (Exception e) {
            System.err.println("=== DNS RESOLUTION FAILED: " + e.getMessage());
        }

        URL url = new URL(tokenUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Accept", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(15000);
        conn.setReadTimeout(15000);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(jsonBody.getBytes(StandardCharsets.UTF_8));
        }

        int responseCode = conn.getResponseCode();
        System.out.println("=== SHOPIFY RESPONSE CODE: " + responseCode);

        java.io.InputStream is = responseCode >= 200 && responseCode < 300
                ? conn.getInputStream() : conn.getErrorStream();

        String responseBody = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        System.out.println("=== SHOPIFY RESPONSE: " + responseBody);

        @SuppressWarnings("unchecked")
        Map<String, Object> result = objectMapper.readValue(responseBody, Map.class);
        return result;
    }

    // ── Find or create user helper ────────────────────────
    private User findOrCreateUser(String shop, String emailFromState, String emailFromPrincipal) {
        User user = null;

        if (emailFromPrincipal != null) {
            user = userRepo.findByEmail(emailFromPrincipal).orElse(null);
            System.out.println("Found by principal: " + (user != null));
        }
        if (user == null && emailFromState != null && !emailFromState.isBlank()) {
            user = userRepo.findByEmail(emailFromState).orElse(null);
            System.out.println("Found by state email: " + (user != null));
        }
        if (user == null) {
            user = userRepo.findByShopDomain(shop).orElse(null);
            System.out.println("Found by shopDomain: " + (user != null));
        }
        if (user == null) {
            System.out.println("Creating new user for shop: " + shop);
            user = new User();
            user.setName("Store Owner");
            user.setEmail(shop.replace(".myshopify.com", "") + "@optiviseai.io");
            user.setPassword(passwordEncoder.encode("oauth_" + UUID.randomUUID()));
            user.setRole("Store Owner");
            user.setPlan("free");
        }
        return user;
    }

    // ── Step 1: Redirect to Shopify OAuth ────────────────
    @GetMapping("/install")
    public ResponseEntity<?> install(
            @RequestParam String shop,
            @RequestParam(required = false) String email) {

        String cleanShop = shop.trim()
                .replace("https://", "").replace("http://", "").replace("/", "");
        if (!cleanShop.contains(".myshopify.com")) {
            cleanShop = cleanShop + ".myshopify.com";
        }

        String statePayload = UUID.randomUUID().toString().replace("-", "");
        if (email != null && !email.isBlank()) {
            statePayload = statePayload + "___" + email;
        }

        String authUrl = "https://" + cleanShop + "/admin/oauth/authorize" +
                "?client_id=" + clientId +
                "&scope=" + URLEncoder.encode(SCOPES, StandardCharsets.UTF_8) +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                "&state=" + URLEncoder.encode(statePayload, StandardCharsets.UTF_8);

        return ResponseEntity.ok(Map.of("authUrl", authUrl, "shop", cleanShop));
    }

    // ── Step 2: Handle OAuth callback (direct Shopify redirect) ──
    @GetMapping("/callback")
    public ResponseEntity<?> callback(
            @RequestParam String code,
            @RequestParam String shop,
            @RequestParam String state,
            @RequestParam String hmac,
            @RequestParam Map<String, String> allParams) {

        System.out.println("=== OAUTH CALLBACK HIT ===");
        System.out.println("Shop: " + shop);

        if (!verifyHmac(allParams, hmac)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid HMAC"));
        }

        try {
            Map<String, Object> tokenResponse = exchangeCodeForToken(shop, code);

            String accessToken = (String) tokenResponse.get("access_token");
            if (accessToken == null || accessToken.isBlank()) {
                System.err.println("=== CALLBACK ERROR: no access_token: " + tokenResponse);
                return ResponseEntity.status(302)
                        .header("Location", "https://www.optiviseai.io/login?error=oauth_failed")
                        .build();
            }

            String emailFromState = null;
            if (state != null && state.contains("___")) {
                emailFromState = state.substring(state.indexOf("___") + 3).trim();
            }

            User user = findOrCreateUser(shop, emailFromState, null);
            user.setShopDomain(shop);
            user.setShopifyAccessToken(accessToken);
            userRepo.save(user);
            System.out.println("Saved user: " + user.getEmail());

            String jwt = jwtService.generateToken(user.getEmail());
            String redirectUrl = "https://www.optiviseai.io/oauth/success?token=" + jwt +
                    "&shop=" + URLEncoder.encode(shop, StandardCharsets.UTF_8);

            return ResponseEntity.status(302).header("Location", redirectUrl).build();

        } catch (Exception e) {
            System.err.println("=== CALLBACK ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(302)
                    .header("Location", "https://www.optiviseai.io/login?error=oauth_failed")
                    .build();
        }
    }

    // ── POST /api/auth/shopify/exchange ───────────────────
    // Called by frontend callback page
    @PostMapping("/exchange")
    public ResponseEntity<?> exchange(
            @RequestParam String code,
            @RequestParam String shop,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String hmac,
            Principal principal) {

        System.out.println("=== SHOPIFY EXCHANGE ===");
        System.out.println("Shop: " + shop);
        System.out.println("State: " + state);

        try {
            Map<String, Object> tokenResponse = exchangeCodeForToken(shop, code);

            String accessToken = (String) tokenResponse.get("access_token");
            if (accessToken == null || accessToken.isBlank()) {
                System.err.println("=== EXCHANGE ERROR: no access_token: " + tokenResponse);
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "No access token returned from Shopify"));
            }

            System.out.println("Access token received: true");

            String emailFromState = null;
            if (state != null && state.contains("___")) {
                emailFromState = state.substring(state.indexOf("___") + 3).trim();
            }

            String emailFromPrincipal = (principal != null) ? principal.getName() : null;

            User user = findOrCreateUser(shop, emailFromState, emailFromPrincipal);
            user.setShopDomain(shop);
            user.setShopifyAccessToken(accessToken);
            userRepo.save(user);
            System.out.println("Saved: " + user.getEmail() + " shop: " + user.getShopDomain());

            String jwt = jwtService.generateToken(user.getEmail());
            return ResponseEntity.ok(Map.of(
                    "token", jwt,
                    "shop", shop,
                    "email", user.getEmail()
            ));

        } catch (Exception e) {
            System.err.println("=== EXCHANGE ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
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
            return ResponseEntity.ok(Map.of("success", true, "message", "Shopify store disconnected"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
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