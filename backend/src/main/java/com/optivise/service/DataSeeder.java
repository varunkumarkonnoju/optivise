package com.optivise.service;

import com.optivise.model.*;
import com.optivise.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Autowired private UserRepository userRepo;
    @Autowired private MetricSnapshotRepository metricRepo;
    @Autowired private AbTestRepository abTestRepo;
    @Autowired private AiSuggestionRepository suggestionRepo;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) {
        if (userRepo.existsByEmail("sarah@optivise.io")) return;
        log.info("Seeding demo data...");

        // Demo user
        User user = User.builder()
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
            MetricSnapshot m = new MetricSnapshot();
            m.setShop(shop);
            m.setDate(LocalDateTime.now().minusDays(i));
            m.setTotalRevenue(base);
            m.setConversionRate(3.0 + rnd.nextDouble() * 1.5);
            m.setOrders((long)(base / 45));
            m.setSessions((long)(base / 45 * (28 + rnd.nextInt(10))));
            m.setAvgOrderValue(base / Math.max(1, base / 45));
            m.setAiGrowthScore(60 + rnd.nextInt(30));
            metricRepo.save(m);
        }

        // Demo A/B tests
        String[] testNames = {"Homepage Hero", "Product CTA Button", "Checkout Flow"};
        String[] statuses = {"running", "completed", "paused"};
        for (int i = 0; i < 3; i++) {
            AbTest t = new AbTest();
            t.setName(testNames[i]);
            t.setShop(shop);
            t.setStatus(statuses[i]);
            t.setElementType("hero");
            t.setVariantALabel("Original");
            t.setVariantBLabel("Variant B");
            t.setVariantAConversion(3.2 + rnd.nextDouble() * 2);
            t.setVariantBConversion(3.8 + rnd.nextDouble() * 2);
            t.setVariantATraffic(1000 + rnd.nextInt(500));
            t.setVariantBTraffic(1000 + rnd.nextInt(500));
            abTestRepo.save(t);
        }

        // Demo AI suggestions
        String[] titles = {
                "Add product descriptions to 3 products",
                "Optimize checkout flow",
                "Add customer reviews section"
        };
        String[] descs = {
                "3 products missing descriptions — add AI copy to boost conversions by 20%",
                "Simplify checkout to reduce cart abandonment",
                "Social proof increases conversions by up to 15%"
        };
        String[] impacts = {"High", "High", "Medium"};
        for (int i = 0; i < 3; i++) {
            AiSuggestion s = new AiSuggestion();
            s.setShop(shop);
            s.setTitle(titles[i]);
            s.setDescription(descs[i]);
            s.setImpact(impacts[i]);
            s.setCategory("product");
            s.setApplied(false);
            s.setCreatedAt(LocalDateTime.now().minusDays(i));
            suggestionRepo.save(s);
        }

        log.info("Demo data seeded. Login: sarah@optivise.io / demo1234");
    }
}