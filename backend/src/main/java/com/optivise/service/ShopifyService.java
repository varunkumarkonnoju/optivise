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
            String url = "https://" + domain + "/admin/api/2023-10/products.json?limit=250";
            String response = shopifyWebClient
                    .get().uri(url)
                    .header("X-Shopify-Access-Token", token)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            Map<String, Object> parsed = mapper.readValue(response, Map.class);
            Object products = parsed.get("products");
            if (products == null) {
                log.warn("No products key in Shopify response: {}", response.substring(0, Math.min(200, response.length())));
                return new ArrayList<>();
            }
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
            String url = "https://" + domain + "/admin/api/2023-10/orders.json?limit=250&status=any";
            String response = shopifyWebClient
                    .get().uri(url)
                    .header("X-Shopify-Access-Token", token)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            Map<String, Object> parsed = mapper.readValue(response, Map.class);
            Object orders = parsed.get("orders");
            if (orders == null) {
                log.warn("No orders key in Shopify response: {}", response.substring(0, Math.min(200, response.length())));
                return new ArrayList<>();
            }
            return (List<Map<String, Object>>) orders;
        } catch (Exception e) {
            log.error("Failed to fetch Shopify orders: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    // ── Update product description ────────────────────────
    public boolean updateProductDescription(String productId, String description,
                                            String domain, String token) {
        try {
            String url = "https://" + domain + "/admin/api/2023-10/products/" + productId + ".json";
            String body = "{\"product\":{\"id\":" + productId + ",\"body_html\":\"" +
                    description.replace("\"", "\\\"") + "\"}}";
            WebClient.create()
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