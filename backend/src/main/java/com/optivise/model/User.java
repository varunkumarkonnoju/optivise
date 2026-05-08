package com.optivise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(unique = true)
    private String email;
    private String password;
    private String role;
    private String shopDomain;
    private String shopifyAccessToken;
    private String plan;
    private String stripeCustomerId;
    private String subscriptionStatus;
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // ── NEW: Usage tracking fields ──────────────────────
    @Column(columnDefinition = "integer default 0")
    private Integer usageCount = 0;          // how many AI descriptions used this month

    private LocalDateTime usageResetDate;    // when the counter resets (1st of next month)

    public User() {}
    @PrePersist void onCreate() {
        createdAt = LocalDateTime.now();
        usageCount = 0;
        usageResetDate = LocalDateTime.now().plusMonths(1).withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0);
    }

    // ── Plan limits helper ───────────────────────────────
    public int getMonthlyLimit() {
        if (plan == null || plan.equalsIgnoreCase("free")) return 15;
        if (plan.equalsIgnoreCase("starter"))              return 500;
        if (plan.equalsIgnoreCase("growth"))               return Integer.MAX_VALUE;
        return 15; // default to free
    }

    public boolean hasReachedLimit() {
        if (plan != null && plan.equalsIgnoreCase("growth")) return false;
        resetIfNewMonth();
        int count = usageCount != null ? usageCount : 0;
        return count >= getMonthlyLimit();
    }

    public void incrementUsage() {
        resetIfNewMonth();
        usageCount = (usageCount != null ? usageCount : 0) + 1;
    }

    private void resetIfNewMonth() {
        if (usageResetDate == null || LocalDateTime.now().isAfter(usageResetDate)) {
            usageCount = 0;
            usageResetDate = LocalDateTime.now().plusMonths(1).withDayOfMonth(1)
                    .withHour(0).withMinute(0).withSecond(0);
        }
    }

    // ── Getters and Setters ──────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getShopDomain() { return shopDomain; }
    public void setShopDomain(String shopDomain) { this.shopDomain = shopDomain; }
    public String getShopifyAccessToken() { return shopifyAccessToken; }
    public void setShopifyAccessToken(String shopifyAccessToken) { this.shopifyAccessToken = shopifyAccessToken; }
    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }
    public String getStripeCustomerId() { return stripeCustomerId; }
    public void setStripeCustomerId(String stripeCustomerId) { this.stripeCustomerId = stripeCustomerId; }
    public String getSubscriptionStatus() { return subscriptionStatus; }
    public void setSubscriptionStatus(String subscriptionStatus) { this.subscriptionStatus = subscriptionStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Integer getUsageCount() { return usageCount != null ? usageCount : 0; }
    public void setUsageCount(Integer usageCount) { this.usageCount = usageCount; }
    public LocalDateTime getUsageResetDate() { return usageResetDate; }
    public void setUsageResetDate(LocalDateTime usageResetDate) { this.usageResetDate = usageResetDate; }

    public static UserBuilder builder() { return new UserBuilder(); }
    public static class UserBuilder {
        private User u = new User();
        public UserBuilder name(String v) { u.name = v; return this; }
        public UserBuilder email(String v) { u.email = v; return this; }
        public UserBuilder password(String v) { u.password = v; return this; }
        public UserBuilder role(String v) { u.role = v; return this; }
        public UserBuilder shopDomain(String v) { u.shopDomain = v; return this; }
        public UserBuilder plan(String v) { u.plan = v; return this; }
        public User build() { return u; }
    }
}