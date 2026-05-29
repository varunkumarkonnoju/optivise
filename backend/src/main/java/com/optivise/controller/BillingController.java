package com.optivise.controller;

import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.model.*;
import com.stripe.model.checkout.Session;
import com.stripe.param.*;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Value("${stripe.publishable.key}")
    private String stripePublishableKey;

    @Value("${stripe.price.starter.monthly}")
    private String starterPriceId;

    @Value("${stripe.price.growth.monthly}")
    private String growthPriceId;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Autowired
    private UserRepository userRepo;

    // ── GET /api/billing/config ───────────────────────────
    // Returns publishable key and plan info to frontend
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        return ResponseEntity.ok(Map.of(
                "publishableKey", stripePublishableKey,
                "plans", List.of(
                        Map.of("id", "starter", "name", "Starter", "price", 29,
                                "priceId", starterPriceId,
                                "features", List.of("Unlimited products","500 AI credits/mo","Full analytics","A/B testing","AI assistant")),
                        Map.of("id", "growth", "name", "Growth", "price", 79,
                                "priceId", growthPriceId,
                                "features", List.of("Everything in Starter","Unlimited AI credits","Bulk generator","Unlimited A/B tests","Priority support"))
                )
        ));
    }

    // ── POST /api/billing/create-checkout ─────────────────
    // Creates a Stripe Checkout session
    @PostMapping("/create-checkout")
    public ResponseEntity<Map<String, Object>> createCheckout(
            @RequestBody Map<String, String> req,
            Principal principal) {
        try {
            Stripe.apiKey = stripeSecretKey;
            User user = userRepo.findByEmail(principal.getName()).orElseThrow();
            String planId = req.get("planId"); // "starter" or "growth"
            String priceId = "growth".equals(planId) ? growthPriceId : starterPriceId;
            String appUrl = req.getOrDefault("appUrl", "https://www.optiviseai.io");

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setCustomerEmail(user.getEmail())
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setPrice(priceId)
                            .setQuantity(1L)
                            .build())
                    .setSubscriptionData(SessionCreateParams.SubscriptionData.builder()
                            .setTrialPeriodDays(14L) // 14-day free trial
                            .build())
                    .setSuccessUrl(appUrl + "/billing/success?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(appUrl + "/pricing")
                    .putMetadata("userId", user.getId().toString())
                    .putMetadata("userEmail", user.getEmail())
                    .putMetadata("plan", planId)
                    .build();

            Session session = Session.create(params);
            return ResponseEntity.ok(Map.of(
                    "checkoutUrl", session.getUrl(),
                    "sessionId", session.getId()
            ));
        } catch (Exception e) {
            System.err.println("Stripe checkout error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to create checkout: " + e.getMessage()
            ));
        }
    }

    // ── POST /api/billing/portal ──────────────────────────
    // Opens Stripe billing portal for managing subscription
    @PostMapping("/portal")
    public ResponseEntity<Map<String, Object>> createPortal(
            @RequestBody Map<String, String> req,
            Principal principal) {
        try {
            Stripe.apiKey = stripeSecretKey;
            User user = userRepo.findByEmail(principal.getName()).orElseThrow();
            String appUrl = req.getOrDefault("appUrl", "https://www.optiviseai.io");

            if (user.getStripeCustomerId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No active subscription found"));
            }

            com.stripe.model.billingportal.Session portalSession =
                    com.stripe.model.billingportal.Session.create(
                            com.stripe.param.billingportal.SessionCreateParams.builder()
                                    .setCustomer(user.getStripeCustomerId())
                                    .setReturnUrl(appUrl + "/dashboard")
                                    .build()
                    );
            return ResponseEntity.ok(Map.of("portalUrl", portalSession.getUrl()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /api/billing/subscription ─────────────────────
    // Returns current subscription status
    @GetMapping("/subscription")
    public ResponseEntity<Map<String, Object>> getSubscription(Principal principal) {
        try {
            User user = userRepo.findByEmail(principal.getName()).orElseThrow();
            String plan = user.getPlan() != null ? user.getPlan() : "free";
            String status = user.getSubscriptionStatus() != null ? user.getSubscriptionStatus() : "active";
            // Stripe uses "canceled" (one L); guard against both spellings.
            boolean isActive = !"canceled".equals(status) && !"cancelled".equals(status);
            return ResponseEntity.ok(Map.of(
                    "plan", plan,
                    "status", status,
                    "isActive", isActive,
                    "customerId", user.getStripeCustomerId() != null ? user.getStripeCustomerId() : ""
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("plan", "free", "status", "active", "isActive", true));
        }
    }

    // ── POST /api/billing/webhook ─────────────────────────
    // Handles Stripe webhook events
    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        try {
            Stripe.apiKey = stripeSecretKey;

            // SECURITY: verify the webhook signature so forged requests cannot
            // grant paid plans for free. Requires stripe.webhook.secret to be set
            // (use the Stripe CLI's whsec_... value for local testing).
            if (sigHeader == null || webhookSecret == null || webhookSecret.isBlank()
                    || "whsec_placeholder".equals(webhookSecret)) {
                System.err.println("Webhook rejected: signature header or webhook secret missing/unconfigured");
                return ResponseEntity.badRequest().body("Webhook signature verification not configured");
            }
            Event event;
            try {
                event = com.stripe.net.Webhook.constructEvent(payload, sigHeader, webhookSecret);
            } catch (com.stripe.exception.SignatureVerificationException e) {
                System.err.println("Webhook signature verification failed: " + e.getMessage());
                return ResponseEntity.status(400).body("Invalid signature");
            }

            switch (event.getType()) {
                case "checkout.session.completed" -> {
                    var session = (Session) event.getDataObjectDeserializer()
                            .getObject().orElse(null);
                    if (session != null) {
                        String email = session.getCustomerEmail();
                        String plan = session.getMetadata().get("plan");
                        String customerId = session.getCustomer();
                        userRepo.findByEmail(email).ifPresent(u -> {
                            u.setPlan(plan);
                            u.setStripeCustomerId(customerId);
                            u.setSubscriptionStatus("trialing");
                            userRepo.save(u);
                        });
                    }
                }
                case "customer.subscription.updated", "customer.subscription.deleted" -> {
                    var sub = (Subscription) event.getDataObjectDeserializer()
                            .getObject().orElse(null);
                    if (sub != null) {
                        String customerId = sub.getCustomer();
                        String status = sub.getStatus();
                        userRepo.findAll().stream()
                                .filter(u -> customerId.equals(u.getStripeCustomerId()))
                                .findFirst()
                                .ifPresent(u -> {
                                    u.setSubscriptionStatus(status);
                                    if ("canceled".equals(status)) u.setPlan("free");
                                    userRepo.save(u);
                                });
                    }
                }
            }
            return ResponseEntity.ok("ok");
        } catch (Exception e) {
            System.err.println("Webhook error: " + e.getMessage());
            return ResponseEntity.ok("ok"); // Always return 200 to Stripe
        }
    }
}