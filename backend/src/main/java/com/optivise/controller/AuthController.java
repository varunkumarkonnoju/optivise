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
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepo;
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
            // In production: save token to DB with expiry
            // For now: send email with token
            new Thread(() -> emailService.sendPasswordReset(email, token, user.getName())).start();
        });
        return ResponseEntity.ok(Map.of("message", "If that email exists, a reset link has been sent"));
    }
}