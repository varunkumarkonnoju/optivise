package com.optivise.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Map;

@Service
public class EmailService {

    @Value("${resend.api.key:re_placeholder}")
    private String resendApiKey;

    @Value("${resend.from.email:onboarding@resend.dev}")
    private String fromEmail;

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://api.resend.com")
            .build();

    public boolean sendPasswordReset(String toEmail, String resetToken, String userName) {
        try {
            String resetLink = "https://www.optiviseai.io/reset-password?token=" + resetToken;
            String html = """
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
                    <div style="text-align:center;margin-bottom:24px">
                        <h2 style="color:#6366F1;margin:0">Optivise</h2>
                    </div>
                    <h3 style="color:#1a1a1a">Reset your password</h3>
                    <p style="color:#555">Hi %s,</p>
                    <p style="color:#555">Click the button below to reset your password. This link expires in 1 hour.</p>
                    <div style="text-align:center;margin:32px 0">
                        <a href="%s" style="background:#6366F1;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600">
                            Reset Password
                        </a>
                    </div>
                    <p style="color:#999;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
                    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
                    <p style="color:#999;font-size:12px;text-align:center">© 2026 Optivise · AI Growth Platform for Shopify</p>
                </div>
                """.formatted(userName, resetLink);

            webClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(Map.of(
                            "from", fromEmail,
                            "to", new String[]{toEmail},
                            "subject", "Reset your Optivise password",
                            "html", html
                    ))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return true;
        } catch (Exception e) {
            System.err.println("Email send failed: " + e.getMessage());
            return false;
        }
    }

    public boolean sendWelcome(String toEmail, String userName) {
        try {
            String html = """
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
                    <div style="text-align:center;margin-bottom:24px">
                        <h2 style="color:#6366F1;margin:0">Optivise</h2>
                    </div>
                    <h3 style="color:#1a1a1a">Welcome to Optivise! 🎉</h3>
                    <p style="color:#555">Hi %s,</p>
                    <p style="color:#555">Your account is ready. Here's what you can do:</p>
                    <ul style="color:#555">
                        <li style="margin-bottom:8px">📊 View real analytics from your Shopify store</li>
                        <li style="margin-bottom:8px">✨ Generate AI product descriptions</li>
                        <li style="margin-bottom:8px">🧪 Run A/B tests to boost conversions</li>
                        <li style="margin-bottom:8px">🤖 Ask the AI assistant anything about your store</li>
                    </ul>
                    <div style="text-align:center;margin:32px 0">
                        <a href="https://www.optiviseai.io/dashboard" style="background:#6366F1;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600">
                            Go to Dashboard
                        </a>
                    </div>
                    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
                    <p style="color:#999;font-size:12px;text-align:center">© 2026 Optivise · AI Growth Platform for Shopify</p>
                </div>
                """.formatted(userName);

            webClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(Map.of(
                            "from", fromEmail,
                            "to", new String[]{toEmail},
                            "subject", "Welcome to Optivise! 🎉",
                            "html", html
                    ))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return true;
        } catch (Exception e) {
            System.err.println("Welcome email failed: " + e.getMessage());
            return false;
        }
    }
    public void sendWaitlistNotification(String userEmail, String feature) {
        try {
            String html = "<h2>New Waitlist Signup!</h2>" +
                    "<p><strong>Feature:</strong> " + feature + "</p>" +
                    "<p><strong>Email:</strong> " + userEmail + "</p>" +
                    "<p>Someone just joined the waitlist on Optivise!</p>";
            webClient.post().uri("/emails")
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(Map.of("from", fromEmail, "to", new String[]{"varunkumarkonnoju@gmail.com"},
                            "subject", "New Waitlist Signup: " + feature, "html", html))
                    .retrieve().bodyToMono(String.class).block();
        } catch (Exception e) {
            System.err.println("Waitlist notification email failed: " + e.getMessage());
        }
    }

    public void sendWaitlistConfirmation(String userEmail, String feature) {
        try {
            String html = "<div style='font-family:sans-serif;max-width:600px;margin:0 auto'>" +
                    "<h2 style='color:#6366F1'>You're on the waitlist! 🎉</h2>" +
                    "<p>Thanks for your interest in <strong>" + feature + "</strong>.</p>" +
                    "<p>We'll email you as soon as it launches. Early access users get it <strong>free for 30 days!</strong></p>" +
                    "<p style='color:#666'>— The Optivise Team</p></div>";
            webClient.post().uri("/emails")
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(Map.of("from", fromEmail, "to", new String[]{userEmail},
                            "subject", "You're on the waitlist for " + feature + " — Optivise", "html", html))
                    .retrieve().bodyToMono(String.class).block();
        } catch (Exception e) {
            System.err.println("Waitlist confirmation email failed: " + e.getMessage());
        }
    }

}