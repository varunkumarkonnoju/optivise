package com.optivise.service;

import com.optivise.model.*;
import com.optivise.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final MetricSnapshotRepository metricRepo;
    private final AbTestRepository abTestRepo;
    private final AiSuggestionRepository suggestionRepo;
    private final ProductRepository productRepo;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (userRepo.existsByEmail("sarah@optivise.io")) return;
        log.info("Seeding demo data...");

        // Demo user
        var user = User.builder()
                .name("Sarah Chen").email("sarah@optivise.io")
                .password(encoder.encode("demo1234"))
                .role("Store Owner").shopDomain("sarah-store.myshopify.com")
                .build();
        userRepo.save(user);

        String shop = "sarah-store.myshopify.com";
        Random rnd = new Random(42);

        // 30 days of metrics
        for (int i = 29; i >= 0; i--) {
            double base = 3500 + rnd.nextDouble() * 2000;
            metricRepo.save(MetricSnapshot.builder()
                    .shop(shop)
                    .date(LocalDateTime.now().minusDays(i))
                    .totalRevenue(base)
                    .conversionRate(3.0 + rnd.nextDouble() * 1.5)
                    .sessions(2000L + rnd.nextInt(1000))
                    .orders(60L + rnd.nextInt(40))
                    .avgOrderValue(55 + rnd.nextDouble() * 30)
                    .aiGrowthScore(70 + rnd.nextInt(20))
                    .build());
        }

        // A/B Tests
        abTestRepo.saveAll(List.of(
                AbTest.builder().shop(shop).name("Homepage Hero Image").status("running")
                        .elementType("hero").variantALabel("Variant A").variantBLabel("Variant B")
                        .variantAConversion(3.24).variantBConversion(8.67)
                        .variantATraffic(50).variantBTraffic(50)
                        .insight("Variant B is performing better. We recommend running for 2 more days.")
                        .startedAt(LocalDateTime.now().minusDays(5)).build(),
                AbTest.builder().shop(shop).name("Checkout Button Color").status("completed")
                        .elementType("button").variantALabel("Blue CTA").variantBLabel("Green CTA")
                        .variantAConversion(4.1).variantBConversion(5.8)
                        .variantATraffic(50).variantBTraffic(50)
                        .winner("Variant B").insight("Green CTA increased conversions by 41%.")
                        .startedAt(LocalDateTime.now().minusDays(14))
                        .endedAt(LocalDateTime.now().minusDays(7)).build(),
                AbTest.builder().shop(shop).name("Product Price Display").status("paused")
                        .elementType("pricing").variantALabel("Price First").variantBLabel("Value First")
                        .variantAConversion(2.9).variantBConversion(3.4)
                        .variantATraffic(50).variantBTraffic(50)
                        .insight("Insufficient data. Resume to gather more results.")
                        .startedAt(LocalDateTime.now().minusDays(3)).build()
        ));

        // AI Suggestions
        suggestionRepo.saveAll(List.of(
                AiSuggestion.builder().shop(shop)
                        .title("Optimize Product Descriptions")
                        .description("3 products have low conversion. AI can improve them.")
                        .impact("High").category("product").applied(false).build(),
                AiSuggestion.builder().shop(shop)
                        .title("Run A/B Test on Homepage")
                        .description("Test 2 different hero images to boost conversion.")
                        .impact("Medium").category("conversion").applied(false).build(),
                AiSuggestion.builder().shop(shop)
                        .title("Adjust Pricing Strategy")
                        .description("AI suggests a 10% discount on 5 products.")
                        .impact("High").category("pricing").applied(false).build(),
                AiSuggestion.builder().shop(shop)
                        .title("Email Retargeting Campaign")
                        .description("68 abandoned carts detected this week. Set up automated recovery.")
                        .impact("High").category("marketing").applied(false).build(),
                AiSuggestion.builder().shop(shop)
                        .title("Add Product Bundle Offers")
                        .description("Customers who bought Wireless Headphones also viewed Smart Watch.")
                        .impact("Medium").category("product").applied(true).build()
        ));

        // Products
        productRepo.saveAll(List.of(
                Product.builder().shop(shop).shopifyProductId("p001")
                        .title("Wireless Headphones").price(149.99).revenue(24530.0)
                        .sessions(892).conversionRate(8.2).optimizationStatus("optimized")
                        .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop").build(),
                Product.builder().shop(shop).shopifyProductId("p002")
                        .title("Smart Watch").price(299.99).revenue(18920.0)
                        .sessions(601).conversionRate(6.1).optimizationStatus("needs-attention")
                        .imageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop").build(),
                Product.builder().shop(shop).shopifyProductId("p003")
                        .title("Leather Backpack").price(89.99).revenue(15430.0)
                        .sessions(743).conversionRate(5.7).optimizationStatus("needs-attention")
                        .imageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80&h=80&fit=crop").build(),
                Product.builder().shop(shop).shopifyProductId("p004")
                        .title("Portable Speaker").price(79.99).revenue(9870.0)
                        .sessions(534).conversionRate(4.3).optimizationStatus("critical")
                        .imageUrl("https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=80&h=80&fit=crop").build(),
                Product.builder().shop(shop).shopifyProductId("p005")
                        .title("Mechanical Keyboard").price(199.99).revenue(12340.0)
                        .sessions(412).conversionRate(7.1).optimizationStatus("optimized")
                        .imageUrl("https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=80&h=80&fit=crop").build()
        ));

        log.info("Demo data seeded. Login: sarah@optivise.io / demo1234");
    }
}
