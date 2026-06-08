package com.optivise.controller;

import com.optivise.model.WaitlistEntry;
import com.optivise.repository.WaitlistEntryRepository;
import com.optivise.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/waitlist")
public class WaitlistController {

    @Autowired private EmailService emailService;
    @Autowired private WaitlistEntryRepository waitlistRepo;

    @PostMapping
    public ResponseEntity<?> joinWaitlist(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String struggle = body.getOrDefault("struggle", "").trim();

        // Basic validation
        if (email.isEmpty() || !email.contains("@") || !email.contains(".")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please enter a valid email address"));
        }

        // Already on the list? Treat as success (idempotent) — don't double-email or error.
        if (waitlistRepo.existsByEmail(email)) {
            long position = waitlistRepo.count();
            return ResponseEntity.ok(Map.of(
                    "message", "You're already on the waitlist!",
                    "alreadyJoined", true,
                    "position", position
            ));
        }

        // Save the entry (this is the actual waitlist)
        try {
            waitlistRepo.save(new WaitlistEntry(email, struggle.isEmpty() ? null : struggle));
        } catch (Exception e) {
            System.err.println("=== WAITLIST SAVE FAILED: " + e.getMessage() + " ===");
            return ResponseEntity.internalServerError().body(Map.of("error", "Something went wrong. Please try again."));
        }

        long position = waitlistRepo.count();

        // Fire emails (best-effort — never block the signup on email failure)
        try {
            String featureLabel = "Growyn early access";
            emailService.sendWaitlistNotification(email, struggle.isEmpty() ? featureLabel : (featureLabel + " — struggle: " + struggle));
            emailService.sendWaitlistConfirmation(email, featureLabel);
        } catch (Exception e) {
            System.err.println("=== WAITLIST EMAIL FAILED: " + e.getMessage() + " ===");
        }

        return ResponseEntity.ok(Map.of(
                "message", "You're on the waitlist!",
                "alreadyJoined", false,
                "position", position
        ));
    }

    // Simple count endpoint (e.g. to show "Join 42 others" on the page)
    @GetMapping("/count")
    public ResponseEntity<?> count() {
        return ResponseEntity.ok(Map.of("count", waitlistRepo.count()));
    }
}