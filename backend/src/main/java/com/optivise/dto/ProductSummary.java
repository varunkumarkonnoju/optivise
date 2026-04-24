package com.optivise.dto;

public class ProductSummary {
    private Long id;
    private String title;
    private Double revenue;
    private Double revenueDelta;
    private String imageUrl;
    private String optimizationStatus;

    public ProductSummary() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Double getRevenue() { return revenue; }
    public void setRevenue(Double revenue) { this.revenue = revenue; }

    public Double getRevenueDelta() { return revenueDelta; }
    public void setRevenueDelta(Double revenueDelta) { this.revenueDelta = revenueDelta; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getOptimizationStatus() { return optimizationStatus; }
    public void setOptimizationStatus(String optimizationStatus) { this.optimizationStatus = optimizationStatus; }
}
