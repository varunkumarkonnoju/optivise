package com.optivise.controller;

import com.optivise.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/waitlist")
public class WaitlistController {

    @Autowired private EmailService emailService;

    @PostMapping
    public ResponseEntity<?> joinWaitlist(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        String feature = body.getOrDefault("feature", "Unknown feature");

        if (email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email required"));
        }

        try {
            // Notify you (Varun) about new waitlist signup
            emailService.sendWaitlistNotification(email, feature);
            // Send confirmation to user
            emailService.sendWaitlistConfirmation(email, feature);
        } catch (Exception e) {
            System.err.println("Waitlist email failed: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Added to waitlist"));
    }
}