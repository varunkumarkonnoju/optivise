package com.optivise.controller;

import com.optivise.dto.AuthResponse;
import com.optivise.dto.LoginRequest;
import com.optivise.dto.RegisterRequest;
import com.optivise.model.User;
import com.optivise.model.PasswordResetToken;
import com.optivise.repository.UserRepository;
import com.optivise.repository.PasswordResetTokenRepository;
import com.optivise.service.EmailService;
import com.optivise.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.security.Principal;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepo;
    @Autowired
    private PasswordResetTokenRepository resetTokenRepo;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private EmailService emailService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // ── Simple in-memory login rate limiter ───────────────
    // Blocks an IP after too many failed login attempts in a window.
    private static final int    MAX_ATTEMPTS   = 8;          // allowed failures
    private static final long   WINDOW_MS      = 15 * 60_000;// 15-minute window
    private static final long   LOCK_MS        = 15 * 60_000;// 15-minute lock
    private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();

    private static class Attempt {
        int count;
        long windowStart;
        long lockedUntil;
    }

    private boolean isLocked(String ip) {
        Attempt a = attempts.get(ip);
        return a != null && a.lockedUntil > System.currentTimeMillis();
    }

    private void recordFailure(String ip) {
        long now = System.currentTimeMillis();
        attempts.compute(ip, (k, a) -> {
            if (a == null || now - a.windowStart > WINDOW_MS) {
                a = new Attempt();
                a.windowStart = now;
            }
            a.count++;
            if (a.count >= MAX_ATTEMPTS) {
                a.lockedUntil = now + LOCK_MS;
            }
            return a;
        });
    }

    private void recordSuccess(String ip) {
        attempts.remove(ip); // clear on successful login
    }

    private String clientIp(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        if (fwd != null && !fwd.isBlank()) return fwd.split(",")[0].trim();
        return req.getRemoteAddr();
    }

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
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest httpReq) {
        String ip = clientIp(httpReq);

        // Rate limit: reject if this IP is temporarily locked.
        if (isLocked(ip)) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "Too many login attempts. Please try again in a few minutes."));
        }

        var userOpt = userRepo.findByEmail(req.getEmail().toLowerCase().trim());
        if (userOpt.isEmpty()) {
            recordFailure(ip);
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
        }
        User user = userOpt.get();
        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            recordFailure(ip);
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
        }

        recordSuccess(ip);
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
            // Invalidate any previous reset tokens for this user
            resetTokenRepo.deleteAll(resetTokenRepo.findByEmail(user.getEmail()));

            String token = UUID.randomUUID().toString();
            // Store only the hash; the raw token goes in the emailed link.
            resetTokenRepo.save(new PasswordResetToken(
                    hashToken(token),
                    user.getEmail(),
                    Instant.now().plusSeconds(3600)   // 1-hour expiry
            ));
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

        PasswordResetToken prt = resetTokenRepo.findByTokenHash(hashToken(token)).orElse(null);
        if (prt == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired reset link"));
        if (prt.isExpired()) {
            resetTokenRepo.delete(prt);
            return ResponseEntity.badRequest().body(Map.of("error", "Reset link has expired. Please request a new one."));
        }
        userRepo.findByEmail(prt.getEmail()).ifPresent(user -> {
            user.setPassword(encoder.encode(newPassword));
            userRepo.save(user);
        });
        resetTokenRepo.delete(prt); // single use
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
                "name", user.getName() != null ? user.getName() : "",
                "email", user.getEmail() != null ? user.getEmail() : "",
                "shopDomain", user.getShopDomain() != null ? user.getShopDomain() : "",
                "hasShopifyToken", user.getShopifyAccessToken() != null && !user.getShopifyAccessToken().isBlank(),
                "role", user.getRole() != null ? user.getRole() : "Store Owner",
                "plan", user.getPlan() != null ? user.getPlan() : "free"
        ));
    }

    // ── Helpers ──────────────────────────────────────────
    // Hash reset tokens before storing so the DB never holds a usable reset link.
    private static String hashToken(String token) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}