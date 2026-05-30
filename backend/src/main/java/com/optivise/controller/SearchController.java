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
        if (q == null || q.trim().length() < 2 || principal == null) return results;
        String query = q.trim().toLowerCase();

        User user = userRepo.findByEmail(principal.getName()).orElse(null);
        if (user == null || user.getShopDomain() == null || user.getShopifyAccessToken() == null) return results;

        String shop = user.getShopDomain();
        String token = user.getShopifyAccessToken();

        try {
            for (Map<String, Object> p : shopifyService.fetchProducts(shop, token)) {
                String title = s(p.get("title"));
                if (!title.isEmpty() && title.toLowerCase().contains(query)) {
                    results.add(result("product", title, "Product", "/products"));
                    if (results.size() >= 8) return results;
                }
            }
        } catch (Exception ignored) {}

        try {
            for (Map<String, Object> c : shopifyService.fetchCustomers(shop, token)) {
                String name = (s(c.get("first_name")) + " " + s(c.get("last_name"))).trim();
                String email = s(c.get("email"));
                if ((!name.isEmpty() && name.toLowerCase().contains(query))
                        || (!email.isEmpty() && email.toLowerCase().contains(query))) {
                    results.add(result("customer", name.isEmpty() ? email : name, email, "/customers"));
                    if (results.size() >= 8) return results;
                }
            }
        } catch (Exception ignored) {}

        try {
            for (Map<String, Object> o : shopifyService.fetchOrders(shop, token)) {
                String name = s(o.get("name"));
                if (!name.isEmpty() && name.toLowerCase().contains(query)) {
                    results.add(result("order", name, "$" + s(o.get("total_price")), "/analytics"));
                    if (results.size() >= 8) return results;
                }
            }
        } catch (Exception ignored) {}

        return results;
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