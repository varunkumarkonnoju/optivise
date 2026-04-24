package com.optivise.controller;

import com.optivise.dto.AuthResponse;
import com.optivise.dto.LoginRequest;
import com.optivise.dto.RegisterRequest;
import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import com.optivise.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepo;
    private final JwtService jwtService;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtService.generateToken(user.getEmail());
        return ResponseEntity.ok(AuthResponse.builder()
                .token(token).name(user.getName()).email(user.getEmail())
                .shopDomain(user.getShopDomain()).role(user.getRole()).build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            return ResponseEntity.badRequest().body(Map.of("error", "Email already in use"));
        User user = User.builder()
                .name(req.getName()).email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .shopDomain(req.getShopDomain()).role("Store Owner").build();
        userRepo.save(user);
        String token = jwtService.generateToken(user.getEmail());
        return ResponseEntity.ok(AuthResponse.builder()
                .token(token).name(user.getName()).email(user.getEmail())
                .shopDomain(user.getShopDomain()).role(user.getRole()).build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Principal principal) {
        User user = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(AuthResponse.builder()
                .name(user.getName()).email(user.getEmail())
                .shopDomain(user.getShopDomain()).role(user.getRole()).build());
    }
}
