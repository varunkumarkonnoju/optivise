package com.optivise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String shop;
    private String shopifyProductId;
    private String title;
    private Double price;
    private Double revenue;
    private Integer sessions;
    private Double conversionRate;
    private String optimizationStatus;
    private String imageUrl;
    private LocalDateTime updatedAt;

    public Product() {}

    @PrePersist @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getShop() { return shop; }
    public void setShop(String shop) { this.shop = shop; }
    public String getShopifyProductId() { return shopifyProductId; }
    public void setShopifyProductId(String shopifyProductId) { this.shopifyProductId = shopifyProductId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Double getRevenue() { return revenue; }
    public void setRevenue(Double revenue) { this.revenue = revenue; }
    public Integer getSessions() { return sessions; }
    public void setSessions(Integer sessions) { this.sessions = sessions; }
    public Double getConversionRate() { return conversionRate; }
    public void setConversionRate(Double conversionRate) { this.conversionRate = conversionRate; }
    public String getOptimizationStatus() { return optimizationStatus; }
    public void setOptimizationStatus(String optimizationStatus) { this.optimizationStatus = optimizationStatus; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static ProductBuilder builder() { return new ProductBuilder(); }
    public static class ProductBuilder {
        private Product p = new Product();
        public ProductBuilder shop(String v) { p.shop = v; return this; }
        public ProductBuilder shopifyProductId(String v) { p.shopifyProductId = v; return this; }
        public ProductBuilder title(String v) { p.title = v; return this; }
        public ProductBuilder price(Double v) { p.price = v; return this; }
        public ProductBuilder revenue(Double v) { p.revenue = v; return this; }
        public ProductBuilder sessions(Integer v) { p.sessions = v; return this; }
        public ProductBuilder conversionRate(Double v) { p.conversionRate = v; return this; }
        public ProductBuilder optimizationStatus(String v) { p.optimizationStatus = v; return this; }
        public ProductBuilder imageUrl(String v) { p.imageUrl = v; return this; }
        public Product build() { return p; }
    }
}
