package com.optivise.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class ShopifyService {

    @Value("${shopify.store.domain}")
    private String storeDomain;

    @Value("${shopify.store.access.token}")
    private String accessToken;

    private WebClient getClient() {
        return WebClient.builder()
                .baseUrl("https://" + storeDomain)
                .defaultHeader("X-Shopify-Access-Token", accessToken)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    // ── Fetch real products from Shopify ─────────────────
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> fetchProducts() {
        try {
            var response = getClient().get()
                    .uri("/admin/api/2024-01/products.json?limit=50&fields=id,title,body_html,images,variants,product_type,tags,vendor,status")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("products")) {
                return (List<Map<String, Object>>) response.get("products");
            }
        } catch (Exception e) {
            log.error("Failed to fetch Shopify products: {}", e.getMessage());
        }
        return new ArrayList<>();
    }

    // ── Fetch real orders for revenue data ───────────────
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> fetchOrders() {
        try {
            var response = getClient().get()
                    .uri("/admin/api/2024-01/orders.json?limit=250&status=any&fields=id,total_price,line_items,created_at,financial_status")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("orders")) {
                return (List<Map<String, Object>>) response.get("orders");
            }
        } catch (Exception e) {
            log.error("Failed to fetch Shopify orders: {}", e.getMessage());
        }
        return new ArrayList<>();
    }

    // ── Get store info ────────────────────────────────────
    @SuppressWarnings("unchecked")
    public Map<String, Object> fetchShopInfo() {
        try {
            var response = getClient().get()
                    .uri("/admin/api/2024-01/shop.json")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("shop")) {
                return (Map<String, Object>) response.get("shop");
            }
        } catch (Exception e) {
            log.error("Failed to fetch shop info: {}", e.getMessage());
        }
        return Map.of();
    }

    // ── Update a product description ──────────────────────
    public boolean updateProductDescription(String productId, String newDescription) {
        try {
            var body = Map.of("product", Map.of(
                    "id", productId,
                    "body_html", newDescription
            ));
            getClient().put()
                    .uri("/admin/api/2024-01/products/" + productId + ".json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            return true;
        } catch (Exception e) {
            log.error("Failed to update product {}: {}", productId, e.getMessage());
            return false;
        }
    }

    public String getStoreDomain() { return storeDomain; }
}
