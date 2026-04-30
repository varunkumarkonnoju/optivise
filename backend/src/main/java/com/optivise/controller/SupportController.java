package com.optivise.controller;

import com.optivise.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    @Autowired private EmailService emailService;

    @PostMapping("/contact")
    public ResponseEntity<?> contact(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "unknown");
        String name = body.getOrDefault("name", "User");
        String subject = body.getOrDefault("subject", "Support Request");
        String message = body.getOrDefault("message", "");

        try {
            String html = "<h2>New Support Request from " + name + "</h2>" +
                    "<p><strong>Email:</strong> " + email + "</p>" +
                    "<p><strong>Subject:</strong> " + subject + "</p>" +
                    "<p><strong>Message:</strong></p>" +
                    "<p>" + message.replace("\n", "<br>") + "</p>";

            emailService.sendSupportNotification(html, "📧 Support: " + subject, name, email);
        } catch (Exception e) {
            System.err.println("Support email failed: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Support request received"));
    }

    @PostMapping("/feedback")
    public ResponseEntity<?> feedback(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "unknown");
        String name = body.getOrDefault("name", "User");
        String type = body.getOrDefault("type", "suggestion");
        String message = body.getOrDefault("message", "");

        String emoji = switch(type) {
            case "bug" -> "🐛";
            case "feature" -> "✨";
            case "love" -> "❤️";
            default -> "💡";
        };

        try {
            String html = "<h2>" + emoji + " New " + type + " from " + name + "</h2>" +
                    "<p><strong>Email:</strong> " + email + "</p>" +
                    "<p><strong>Type:</strong> " + type + "</p>" +
                    "<p><strong>Message:</strong></p>" +
                    "<p style='background:#f5f5f5;padding:12px;border-radius:8px'>" + message.replace("\n", "<br>") + "</p>";
            emailService.sendSupportNotification(html, emoji + " " + type.substring(0,1).toUpperCase() + type.substring(1) + " from " + name, name, email);
        } catch (Exception e) {
            System.err.println("Feedback email failed: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Feedback received"));
    }
}