package com.optivise.controller;

import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import com.optivise.service.EmailService;
import com.optivise.service.ShopifyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import io.netty.resolver.DefaultAddressResolverGroup;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import reactor.netty.http.client.HttpClient;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private static final Logger log = LoggerFactory.getLogger(CustomerController.class);

    @Autowired private UserRepository userRepo;
    @Autowired private ShopifyService shopifyService;
    @Autowired private EmailService emailService;

    private final ObjectMapper mapper = new ObjectMapper();

    private final WebClient shopifyWebClient = WebClient.builder()
            .clientConnector(new ReactorClientHttpConnector(
                    HttpClient.create().resolver(DefaultAddressResolverGroup.INSTANCE)
            ))
            .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
            .build();

    // ── GET all customers ────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getCustomers(Principal principal) {
        try {
            User user = userRepo.findByEmail(principal.getName()).orElseThrow();
            String domain = user.getShopDomain();
            String token  = user.getShopifyAccessToken();

            if (domain == null || token == null) {
                return ResponseEntity.ok(List.of());
            }

            List<Map<String, Object>> customers = shopifyService.fetchCustomers(domain, token);
            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            log.error("Get customers error: {}", e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }

    // ── GET single customer with orders ─────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomer(@PathVariable String id, Principal principal) {
        try {
            User user = userRepo.findByEmail(principal.getName()).orElseThrow();
            String domain = user.getShopDomain();
            String token  = user.getShopifyAccessToken();

            // Fetch customer orders
            String url = "https://" + domain + "/admin/api/2023-10/customers/" + id + "/orders.json?status=any&limit=50";
            String response = shopifyWebClient.get().uri(url)
                    .header("X-Shopify-Access-Token", token)
                    .header("Accept", "application/json")
                    .exchangeToMono(r -> r.bodyToMono(String.class))
                    .block();

            Map<String, Object> parsed = mapper.readValue(response != null ? response : "{}", Map.class);
            List<?> orders = (List<?>) parsed.getOrDefault("orders", List.of());

            return ResponseEntity.ok(Map.of("orders", orders));
        } catch (Exception e) {
            log.error("Get customer orders error: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("orders", List.of()));
        }
    }

    // ── GET abandoned carts ──────────────────────────────────
    @GetMapping("/abandoned-carts")
    public ResponseEntity<?> getAbandonedCarts(Principal principal) {
        try {
            User user = userRepo.findByEmail(principal.getName()).orElseThrow();
            String domain = user.getShopDomain();
            String token  = user.getShopifyAccessToken();

            if (domain == null || token == null) return ResponseEntity.ok(List.of());

            // Shopify abandoned checkouts API
            String url = "https://" + domain + "/admin/api/2023-10/checkouts.json?limit=50";
            String response = shopifyWebClient.get().uri(url)
                    .header("X-Shopify-Access-Token", token)
                    .header("Accept", "application/json")
                    .exchangeToMono(r -> r.bodyToMono(String.class))
                    .block();

            if (response == null) return ResponseEntity.ok(List.of());

            Map<String, Object> parsed = mapper.readValue(response, Map.class);
            List<?> checkouts = (List<?>) parsed.getOrDefault("checkouts", List.of());

            // Filter only abandoned (have email and items)
            List<Map<String, Object>> abandoned = new ArrayList<>();
            for (Object obj : checkouts) {
                if (obj instanceof Map) {
                    Map<String, Object> checkout = (Map<String, Object>) obj;
                    String email = (String) checkout.get("email");
                    List<?> lineItems = (List<?>) checkout.getOrDefault("line_items", List.of());
                    if (email != null && !email.isBlank() && !lineItems.isEmpty()) {
                        abandoned.add(checkout);
                    }
                }
            }

            return ResponseEntity.ok(abandoned);
        } catch (Exception e) {
            log.error("Get abandoned carts error: {}", e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }

    // ── POST send cart reminder email ────────────────────────
    @PostMapping("/send-reminder")
    public ResponseEntity<?> sendReminder(
            @RequestBody Map<String, String> req,
            Principal principal) {
        try {
            User user = userRepo.findByEmail(principal.getName()).orElseThrow();
            String storeName = user.getShopDomain() != null
                    ? user.getShopDomain().replace(".myshopify.com", "")
                    : "the store";

            String toEmail     = req.get("email");
            String productTitle = req.getOrDefault("productTitle", "your items");
            String cartUrl     = req.getOrDefault("cartUrl", "");

            if (toEmail == null || toEmail.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            boolean sent = emailService.sendAbandonedCartReminder(
                    toEmail, productTitle, cartUrl, storeName
            );

            if (sent) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Reminder sent to " + toEmail));
            }
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send email"));

        } catch (Exception e) {
            log.error("Send reminder error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}