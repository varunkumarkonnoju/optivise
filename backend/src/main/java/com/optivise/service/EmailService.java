package com.optivise.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import reactor.netty.http.client.HttpClient;
import io.netty.resolver.DefaultAddressResolverGroup;
import java.util.Map;

@Service
public class EmailService {

    @Value("${resend.api.key:re_placeholder}")
    private String resendApiKey;

    private String fromEmail = "onboarding@resend.dev";

    private final WebClient webClient = WebClient.builder()
            .clientConnector(new ReactorClientHttpConnector(
                    HttpClient.create().resolver(DefaultAddressResolverGroup.INSTANCE)
            ))
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
                            "from", "Optivise <" + this.fromEmail + ">",
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
                            "from", "Optivise <" + this.fromEmail + ">",
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
                    .bodyValue(Map.of("from", "Optivise <" + this.fromEmail + ">", "to", new String[]{"varunkumarkonnoju@gmail.com"},
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
                    .bodyValue(Map.of("from", "Optivise <" + this.fromEmail + ">", "to", new String[]{userEmail},
                            "subject", "You're on the waitlist for " + feature + " — Optivise", "html", html))
                    .retrieve().bodyToMono(String.class).block();
        } catch (Exception e) {
            System.err.println("Waitlist confirmation email failed: " + e.getMessage());
        }
    }

    public void sendSupportNotification(String html, String subject, String fromName, String fromEmail) {
        try {
            webClient.post().uri("/emails")
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(Map.of("from", "Optivise <" + this.fromEmail + ">",
                            "to", new String[]{"hello@optiviseai.io"},
                            "subject", subject,
                            "html", html))
                    .retrieve().bodyToMono(String.class).block();
        } catch (Exception e) {
            System.err.println("Support email failed: " + e.getMessage());
        }
    }

    // ── WEEKLY REPORT ─────────────────────────────────────────────────────────
    public boolean sendWeeklyReport(
            String toEmail, String userName, String shopDomain,
            double revenue, int orders, double convRate,
            String topProduct, double topRevenue,
            int productCount, long noDescCount,
            String abTestName, String abWinner) {
        try {
            String revenueFormatted    = String.format("$%,.0f", revenue);
            String topRevenueFormatted = String.format("$%,.0f", topRevenue);
            String convFormatted       = String.format("%.1f%%", convRate);
            String trendEmoji          = revenue > 1000 ? "📈" : revenue > 0 ? "📊" : "📉";
            String healthColor         = noDescCount == 0 ? "#10B981" : noDescCount <= 2 ? "#F59E0B" : "#EF4444";
            String healthLabel         = noDescCount == 0 ? "Excellent" : noDescCount <= 2 ? "Good" : "Needs work";

            // A/B test block
            String abSection = "";
            if (abTestName != null && abWinner != null) {
                abSection = """
                    <div style="background:#f8f5ff;border-left:4px solid #6366F1;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:20px">
                        <div style="font-size:11px;font-weight:700;color:#6366F1;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">🧪 A/B TEST WINNER</div>
                        <div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:4px">%s</div>
                        <div style="font-size:13px;color:#555">Winner: <strong style="color:#10B981">%s</strong></div>
                    </div>
                    """.formatted(abTestName, abWinner);
            }

            // Revenue leak block
            String leakSection = "";
            if (noDescCount > 0) {
                long estimatedLoss = noDescCount * 360L;
                leakSection = """
                    <div style="background:#fff5f5;border-left:4px solid #EF4444;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:20px">
                        <div style="font-size:11px;font-weight:700;color:#EF4444;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">⚠️ REVENUE LEAK DETECTED</div>
                        <div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:4px">%d product%s with no description</div>
                        <div style="font-size:13px;color:#555">Estimated loss: <strong style="color:#EF4444">~$%,d/month</strong></div>
                        <a href="https://www.optiviseai.io/products" style="display:inline-block;margin-top:10px;background:#EF4444;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600">Fix now →</a>
                    </div>
                    """.formatted(noDescCount, noDescCount > 1 ? "s" : "", estimatedLoss);
            }

            String html = """
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
                <body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
                  <div style="max-width:580px;margin:0 auto;padding:32px 16px">

                    <div style="background:linear-gradient(135deg,#020817 0%%,#0d1b35 100%%);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center">
                      <div style="color:#6366F1;font-size:22px;font-weight:900;letter-spacing:-0.5px;margin-bottom:4px">Optivise</div>
                      <div style="color:rgba(255,255,255,0.5);font-size:12px">Weekly Store Report</div>
                    </div>

                    <div style="background:white;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.08)">

                      <p style="font-size:16px;color:#1a1a1a;margin:0 0 6px 0">Hey %s %s 👋</p>
                      <p style="font-size:14px;color:#555;margin:0 0 28px 0">Here's your weekly Optivise report for <strong>%s</strong></p>

                      <div style="background:#f8f5ff;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
                        <div style="font-size:12px;font-weight:700;color:#6366F1;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">THIS WEEK'S REVENUE</div>
                        <div style="font-size:48px;font-weight:900;color:#020817;line-height:1;margin-bottom:8px">%s</div>
                        <div style="font-size:13px;color:#777">%d orders &nbsp;·&nbsp; %s conversion rate</div>
                      </div>

                      <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
                        <tr>
                          <td width="33%%" style="padding-right:6px">
                            <div style="background:#f9f9f9;border-radius:10px;padding:16px;text-align:center">
                              <div style="font-size:22px;font-weight:900;color:#020817">%d</div>
                              <div style="font-size:11px;color:#777;margin-top:4px">Products</div>
                            </div>
                          </td>
                          <td width="33%%" style="padding:0 3px">
                            <div style="background:#f9f9f9;border-radius:10px;padding:16px;text-align:center">
                              <div style="font-size:18px;font-weight:900;color:%s">%s</div>
                              <div style="font-size:11px;color:#777;margin-top:4px">Store health</div>
                            </div>
                          </td>
                          <td width="33%%" style="padding-left:6px">
                            <div style="background:#f9f9f9;border-radius:10px;padding:16px;text-align:center">
                              <div style="font-size:22px;font-weight:900;color:#020817">%d</div>
                              <div style="font-size:11px;color:#777;margin-top:4px">Leaks found</div>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <div style="background:#f0fdf4;border-left:4px solid #10B981;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:20px">
                        <div style="font-size:11px;font-weight:700;color:#10B981;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">🏆 TOP PRODUCT THIS WEEK</div>
                        <div style="font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:2px">%s</div>
                        <div style="font-size:13px;color:#555">Revenue: <strong>%s</strong></div>
                      </div>

                      %s

                      %s

                      <div style="text-align:center;margin:28px 0 20px">
                        <a href="https://www.optiviseai.io/dashboard"
                           style="background:#6366F1;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;display:inline-block">
                          View Full Dashboard →
                        </a>
                      </div>

                      <p style="font-size:12px;color:#999;text-align:center;margin:0">
                        You're receiving this because you have an Optivise account.<br>
                        <a href="https://www.optiviseai.io/settings" style="color:#6366F1">Manage email preferences</a>
                      </p>
                    </div>

                    <div style="text-align:center;padding:20px">
                      <p style="font-size:11px;color:#aaa;margin:0">© 2025 Optivise AI · Built by Varun Kumar Konnoju · Milwaukee, WI</p>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(
                    trendEmoji, userName, shopDomain,
                    revenueFormatted, orders, convFormatted,
                    productCount, healthColor, healthLabel, (int) noDescCount,
                    topProduct, topRevenueFormatted,
                    abSection, leakSection
            );

            webClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(Map.of(
                            "from", "Optivise <" + this.fromEmail + ">",
                            "to", new String[]{toEmail},
                            "subject", trendEmoji + " Your Shopify store this week — Optivise",
                            "html", html
                    ))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return true;
        } catch (Exception e) {
            System.err.println("Weekly report email failed: " + e.getMessage());
            return false;
        }
    }
}