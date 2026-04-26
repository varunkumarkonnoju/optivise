package com.optivise.controller;

import com.optivise.dto.AuthResponse;
import com.optivise.dto.LoginRequest;
import com.optivise.dto.RegisterRequest;
import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import com.optivise.service.EmailService;
import com.optivise.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.security.Principal;
import java.util.concurrent.ConcurrentHashMap;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepo;
    // Simple in-memory token store (token -> [email, expiry])
    private static final ConcurrentHashMap<String, String[]> resetTokens = new ConcurrentHashMap<>();
    @Autowired private JwtService jwtService;
    @Autowired private EmailService emailService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // ── POST /api/auth/register ───────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        // Clean shop domain
        String domain = req.getShopDomain() != null ? req.getShopDomain().trim() : "";
        domain = domain.replace("https://", "").replace("http://", "").replace("/", "");
        if (!domain.isEmpty() && !domain.contains(".myshopify.com")) {
            domain = domain + ".myshopify.com";
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail().toLowerCase().trim());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setRole("Store Owner");
        user.setShopDomain(domain);
        user.setPlan("free");
        userRepo.save(user);

        // Send welcome email async
        final String finalEmail = user.getEmail();
        final String finalName = user.getName();
        new Thread(() -> emailService.sendWelcome(finalEmail, finalName)).start();

        String token = jwtService.generateToken(user.getEmail());
        AuthResponse resp = new AuthResponse();
        resp.setToken(token);
        resp.setName(user.getName());
        resp.setEmail(user.getEmail());
        resp.setShopDomain(user.getShopDomain());
        resp.setRole(user.getRole());
        return ResponseEntity.ok(resp);
    }

    // ── POST /api/auth/login ──────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        var userOpt = userRepo.findByEmail(req.getEmail().toLowerCase().trim());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
        }
        User user = userOpt.get();
        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
        }
        String token = jwtService.generateToken(user.getEmail());
        AuthResponse resp = new AuthResponse();
        resp.setToken(token);
        resp.setName(user.getName());
        resp.setEmail(user.getEmail());
        resp.setShopDomain(user.getShopDomain());
        resp.setRole(user.getRole());
        return ResponseEntity.ok(resp);
    }

    // ── POST /api/auth/forgot-password ───────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        // Always return success (don't reveal if email exists)
        userRepo.findByEmail(email.toLowerCase().trim()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            // Store token with expiry (1 hour)
            resetTokens.put(token, new String[]{user.getEmail(), String.valueOf(Instant.now().plusSeconds(3600).getEpochSecond())});
            new Thread(() -> emailService.sendPasswordReset(email, token, user.getName())).start();
        });
        return ResponseEntity.ok(Map.of("message", "If that email exists, a reset link has been sent"));
    }

    // ── POST /api/auth/reset-password ────────────────────
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> req) {
        String token = req.get("token");
        String newPassword = req.get("password");
        if (token == null || newPassword == null || newPassword.length() < 8)
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid request"));
        String[] tokenData = resetTokens.get(token);
        if (tokenData == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired reset link"));
        long expiry = Long.parseLong(tokenData[1]);
        if (Instant.now().getEpochSecond() > expiry) {
            resetTokens.remove(token);
            return ResponseEntity.badRequest().body(Map.of("error", "Reset link has expired. Please request a new one."));
        }
        String email = tokenData[0];
        userRepo.findByEmail(email).ifPresent(user -> {
            user.setPassword(encoder.encode(newPassword));
            userRepo.save(user);
        });
        resetTokens.remove(token);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    // ── GET /api/auth/me ─────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> me(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        var userOpt = userRepo.findByEmail(principal.getName());
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        User user = userOpt.get();
        return ResponseEntity.ok(Map.of(
                "name",            user.getName() != null ? user.getName() : "",
                "email",           user.getEmail() != null ? user.getEmail() : "",
                "shopDomain",      user.getShopDomain() != null ? user.getShopDomain() : "",
                "hasShopifyToken", user.getShopifyAccessToken() != null && !user.getShopifyAccessToken().isBlank(),
                "role",            user.getRole() != null ? user.getRole() : "Store Owner",
                "plan",            user.getPlan() != null ? user.getPlan() : "free"
        ));
    }
}