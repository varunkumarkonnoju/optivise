package com.optivise.controller;

import com.optivise.model.User;
import com.optivise.repository.UserRepository;
import com.optivise.service.ShopifyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

/**
 * Store-wide search for the connected Shopify store: products, customers, and orders.
 */
@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired private UserRepository userRepo;
    @Autowired private ShopifyService shopifyService;

    @GetMapping
    public List<Map<String, String>> search(@RequestParam("q") String q, Principal principal) {
        List<Map<String, String>> results = new ArrayList<>();
        if (q == null || q.trim().length() < 1 || principal == null) return results;
        String query = q.trim().toLowerCase();

        User user = userRepo.findByEmail(principal.getName()).orElse(null);
        if (user == null || user.getShopDomain() == null || user.getShopifyAccessToken() == null) {
            System.out.println("=== SEARCH: no shop/token for user");
            return results;
        }

        String shop = user.getShopDomain();
        String token = user.getShopifyAccessToken();
        System.out.println("=== SEARCH q='" + query + "' shop=" + shop);

        // ── Products ──
        try {
            List<Map<String, Object>> products = shopifyService.fetchProducts(shop, token);
            System.out.println("=== SEARCH products fetched: " + products.size());
            for (Map<String, Object> p : products) {
                String title  = s(p.get("title"));
                String type   = s(p.get("product_type"));
                String vendor = s(p.get("vendor"));
                if (matches(title, query) || matches(type, query) || matches(vendor, query)) {
                    results.add(result("product", title, "Product", "/products"));
                    if (results.size() >= 10) return results;
                }
            }
        } catch (Exception e) {
            System.err.println("=== SEARCH products error: " + e.getMessage());
        }

        // ── Customers ──
        try {
            List<Map<String, Object>> customers = shopifyService.fetchCustomers(shop, token);
            System.out.println("=== SEARCH customers fetched: " + customers.size());
            for (Map<String, Object> c : customers) {
                String name  = (s(c.get("first_name")) + " " + s(c.get("last_name"))).trim();
                String email = s(c.get("email"));
                if (matches(name, query) || matches(email, query)) {
                    results.add(result("customer", name.isEmpty() ? email : name, email, "/customers"));
                    if (results.size() >= 10) return results;
                }
            }
        } catch (Exception e) {
            System.err.println("=== SEARCH customers error: " + e.getMessage());
        }

        // ── Orders ──
        try {
            List<Map<String, Object>> orders = shopifyService.fetchOrders(shop, token);
            System.out.println("=== SEARCH orders fetched: " + orders.size());
            for (Map<String, Object> o : orders) {
                String name  = s(o.get("name"));               // e.g. "#1001"
                String email = s(o.get("email"));              // customer email on the order
                if (matches(name, query) || matches(email, query)) {
                    results.add(result("order", name, "$" + s(o.get("total_price")), "/analytics"));
                    if (results.size() >= 10) return results;
                }
            }
        } catch (Exception e) {
            System.err.println("=== SEARCH orders error: " + e.getMessage());
        }

        System.out.println("=== SEARCH total results: " + results.size());
        return results;
    }

    private static boolean matches(String field, String query) {
        return field != null && !field.isEmpty() && field.toLowerCase().contains(query);
    }

    private static String s(Object o) { return o == null ? "" : o.toString(); }

    private static Map<String, String> result(String type, String label, String sublabel, String path) {
        Map<String, String> m = new HashMap<>();
        m.put("type", type);
        m.put("label", label);
        m.put("sublabel", sublabel);
        m.put("path", path);
        return m;
    }
}