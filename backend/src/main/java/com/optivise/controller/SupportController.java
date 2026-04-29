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

            emailService.sendSupportNotification(html, subject, name, email);
        } catch (Exception e) {
            System.err.println("Support email failed: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Support request received"));
    }
}