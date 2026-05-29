package com.optivise.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.transport.ProxyProvider;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import io.netty.resolver.DefaultAddressResolverGroup;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ShopifyService {

    private static final Logger log = LoggerFactory.getLogger(ShopifyService.class);

    private final WebClient shopifyWebClient = WebClient.builder()
            .clientConnector(new ReactorClientHttpConnector(
                    HttpClient.create().resolver(DefaultAddressResolverGroup.INSTANCE)
            ))
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)) // 10MB buffer
            .build();

    @Value("${shopify.store.domain}")
    private String defaultDomain;

    @Value("${shopify.store.access.token}")
    private String defaultToken;

    private final ObjectMapper mapper = new ObjectMapper();

    // ── Fetch with user's own credentials ────────────────
    public List<Map<String, Object>> fetchProductsForUser(String shopDomain, String accessToken) {
        return fetchProducts(shopDomain, accessToken);
    }

    public List<Map<String, Object>> fetchOrdersForUser(String shopDomain, String accessToken) {
        return fetchOrders(shopDomain, accessToken);
    }

    // ── Fetch using default (global) credentials ─────────
    public List<Map<String, Object>> fetchProducts() {
        return fetchProducts(defaultDomain, defaultToken);
    }

    public List<Map<String, Object>> fetchOrders() {
        return fetchOrders(defaultDomain, defaultToken);
    }

    // ── Core fetch methods ────────────────────────────────
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> fetchProducts(String domain, String token) {
        try {
            String url = "https://" + domain + "/admin/api/2023-10/products.json?limit=50";
            String response = shopifyWebClient
                    .get().uri(url)
                    .header("X-Shopify-Access-Token", token)
                    .header("Accept", "application/json")
                    .exchangeToMono(r -> r.bodyToMono(String.class))
                    .block();
            if (response == null || response.isBlank()) return new ArrayList<>();
            Map<String, Object> parsed = mapper.readValue(response, Map.class);
            Object products = parsed.get("products");
            if (products == null) return new ArrayList<>();
            return (List<Map<String, Object>>) products;
        } catch (Exception e) {
            log.error("Failed to fetch Shopify products: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> fetchCustomers(String domain, String token) {
        try {
            String url = "https://" + domain + "/admin/api/2024-01/customers.json?limit=250";
            @SuppressWarnings("unchecked")
            Map<String, Object> response = shopifyWebClient.get().uri(url)
                    .header("X-Shopify-Access-Token", token)
                    .retrieve().bodyToMono(Map.class).block();
            if (response != null && response.containsKey("customers")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> customers = (List<Map<String, Object>>) response.get("customers");
                return customers;
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch customers: " + e.getMessage());
        }
        return new ArrayList<>();
    }

    public List<Map<String, Object>> fetchOrders(String domain, String token) {
        try {
            String url = "https://" + domain + "/admin/api/2023-10/orders.json?limit=50&status=any";
            log.info("Fetching orders from: {}", url);
            String response = shopifyWebClient
                    .get().uri(url)
                    .header("X-Shopify-Access-Token", token)
                    .header("Accept", "application/json")
                    .exchangeToMono(r -> {
                        log.info("Orders response status: {}", r.statusCode());
                        return r.bodyToMono(String.class);
                    })
                    .block();
            log.info("Orders response body (first 200): {}", response != null ? response.substring(0, Math.min(200, response.length())) : "null");
            if (response == null || response.isBlank()) return new ArrayList<>();
            Map<String, Object> parsed = mapper.readValue(response, Map.class);
            Object orders = parsed.get("orders");
            if (orders == null) {
                log.warn("No orders key found. Keys: {}", parsed.keySet());
                return new ArrayList<>();
            }
            return (List<Map<String, Object>>) orders;
        } catch (Exception e) {
            log.error("Failed to fetch Shopify orders: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    // ── Update product description ────────────────────────
    public boolean updateProductDescription(String domain, String token,
                                            String productId, String description) {
        try {
            String url = "https://" + domain + "/admin/api/2023-10/products/" + productId + ".json";
            // Build the request body with Jackson so all characters (quotes, newlines,
            // tabs, unicode, control chars) are escaped correctly into valid JSON.
            Map<String, Object> product = new java.util.HashMap<>();
            product.put("id", Long.parseLong(productId));
            product.put("body_html", description != null ? description : "");
            String body = mapper.writeValueAsString(Map.of("product", product));
            shopifyWebClient
                    .put().uri(url)
                    .header("X-Shopify-Access-Token", token)
                    .header("Content-Type", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return true;
        } catch (Exception e) {
            log.error("Failed to update Shopify product: {}", e.getMessage());
            return false;
        }
    }
}