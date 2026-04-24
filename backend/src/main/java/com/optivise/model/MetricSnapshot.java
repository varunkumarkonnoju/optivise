package com.optivise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "metric_snapshots")
public class MetricSnapshot {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String shop;
    private LocalDateTime date;
    private Double totalRevenue;
    private Double conversionRate;
    private Long sessions;
    private Long orders;
    private Double avgOrderValue;
    private Integer aiGrowthScore;

    public MetricSnapshot() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getShop() { return shop; }
    public void setShop(String shop) { this.shop = shop; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
    public Double getConversionRate() { return conversionRate; }
    public void setConversionRate(Double conversionRate) { this.conversionRate = conversionRate; }
    public Long getSessions() { return sessions; }
    public void setSessions(Long sessions) { this.sessions = sessions; }
    public Long getOrders() { return orders; }
    public void setOrders(Long orders) { this.orders = orders; }
    public Double getAvgOrderValue() { return avgOrderValue; }
    public void setAvgOrderValue(Double avgOrderValue) { this.avgOrderValue = avgOrderValue; }
    public Integer getAiGrowthScore() { return aiGrowthScore; }
    public void setAiGrowthScore(Integer aiGrowthScore) { this.aiGrowthScore = aiGrowthScore; }

    public static MetricSnapshotBuilder builder() { return new MetricSnapshotBuilder(); }
    public static class MetricSnapshotBuilder {
        private MetricSnapshot m = new MetricSnapshot();
        public MetricSnapshotBuilder shop(String v) { m.shop = v; return this; }
        public MetricSnapshotBuilder date(LocalDateTime v) { m.date = v; return this; }
        public MetricSnapshotBuilder totalRevenue(Double v) { m.totalRevenue = v; return this; }
        public MetricSnapshotBuilder conversionRate(Double v) { m.conversionRate = v; return this; }
        public MetricSnapshotBuilder sessions(Long v) { m.sessions = v; return this; }
        public MetricSnapshotBuilder orders(Long v) { m.orders = v; return this; }
        public MetricSnapshotBuilder avgOrderValue(Double v) { m.avgOrderValue = v; return this; }
        public MetricSnapshotBuilder aiGrowthScore(Integer v) { m.aiGrowthScore = v; return this; }
        public MetricSnapshot build() { return m; }
    }
}
