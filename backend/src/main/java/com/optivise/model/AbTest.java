package com.optivise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ab_tests")
public class AbTest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String shop;
    private String name;
    private String status; // running, paused, completed
    private String elementType;
    private String variantALabel;
    private String variantBLabel;

    @Column(columnDefinition = "TEXT")
    private String variantADescription;   // actual description text for A

    @Column(columnDefinition = "TEXT")
    private String variantBDescription;   // actual description text for B

    private Double variantAConversion;
    private Double variantBConversion;
    private Integer variantATraffic;
    private Integer variantBTraffic;
    private Integer variantAOrders;
    private Integer variantBOrders;
    private String winner;
    @Column(columnDefinition = "TEXT")
    private String insight;
    private String productId;             // Shopify product ID being tested
    private String productTitle;
    private Double significanceLevel;     // 0-100 statistical confidence
    private Integer targetDays;           // how long to run test
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    public AbTest() {}
    @PrePersist void onCreate() {
        startedAt = LocalDateTime.now();
        if (variantAOrders == null) variantAOrders = 0;
        if (variantBOrders == null) variantBOrders = 0;
        if (significanceLevel == null) significanceLevel = 0.0;
        if (targetDays == null) targetDays = 14;
    }

    // ── getters / setters ──
    public Long getId() { return id; } public void setId(Long v) { id = v; }
    public String getShop() { return shop; } public void setShop(String v) { shop = v; }
    public String getName() { return name; } public void setName(String v) { name = v; }
    public String getStatus() { return status; } public void setStatus(String v) { status = v; }
    public String getElementType() { return elementType; } public void setElementType(String v) { elementType = v; }
    public String getVariantALabel() { return variantALabel; } public void setVariantALabel(String v) { variantALabel = v; }
    public String getVariantBLabel() { return variantBLabel; } public void setVariantBLabel(String v) { variantBLabel = v; }
    public String getVariantADescription() { return variantADescription; } public void setVariantADescription(String v) { variantADescription = v; }
    public String getVariantBDescription() { return variantBDescription; } public void setVariantBDescription(String v) { variantBDescription = v; }
    public Double getVariantAConversion() { return variantAConversion; } public void setVariantAConversion(Double v) { variantAConversion = v; }
    public Double getVariantBConversion() { return variantBConversion; } public void setVariantBConversion(Double v) { variantBConversion = v; }
    public Integer getVariantATraffic() { return variantATraffic; } public void setVariantATraffic(Integer v) { variantATraffic = v; }
    public Integer getVariantBTraffic() { return variantBTraffic; } public void setVariantBTraffic(Integer v) { variantBTraffic = v; }
    public Integer getVariantAOrders() { return variantAOrders != null ? variantAOrders : 0; } public void setVariantAOrders(Integer v) { variantAOrders = v; }
    public Integer getVariantBOrders() { return variantBOrders != null ? variantBOrders : 0; } public void setVariantBOrders(Integer v) { variantBOrders = v; }
    public String getWinner() { return winner; } public void setWinner(String v) { winner = v; }
    public String getInsight() { return insight; } public void setInsight(String v) { insight = v; }
    public String getProductId() { return productId; } public void setProductId(String v) { productId = v; }
    public String getProductTitle() { return productTitle; } public void setProductTitle(String v) { productTitle = v; }
    public Double getSignificanceLevel() { return significanceLevel != null ? significanceLevel : 0.0; } public void setSignificanceLevel(Double v) { significanceLevel = v; }
    public Integer getTargetDays() { return targetDays != null ? targetDays : 14; } public void setTargetDays(Integer v) { targetDays = v; }
    public LocalDateTime getStartedAt() { return startedAt; } public void setStartedAt(LocalDateTime v) { startedAt = v; }
    public LocalDateTime getEndedAt() { return endedAt; } public void setEndedAt(LocalDateTime v) { endedAt = v; }

    public static AbTestBuilder builder() { return new AbTestBuilder(); }
    public static class AbTestBuilder {
        private AbTest t = new AbTest();
        public AbTestBuilder shop(String v) { t.shop = v; return this; }
        public AbTestBuilder name(String v) { t.name = v; return this; }
        public AbTestBuilder status(String v) { t.status = v; return this; }
        public AbTestBuilder elementType(String v) { t.elementType = v; return this; }
        public AbTestBuilder variantALabel(String v) { t.variantALabel = v; return this; }
        public AbTestBuilder variantBLabel(String v) { t.variantBLabel = v; return this; }
        public AbTestBuilder variantADescription(String v) { t.variantADescription = v; return this; }
        public AbTestBuilder variantBDescription(String v) { t.variantBDescription = v; return this; }
        public AbTestBuilder variantAConversion(Double v) { t.variantAConversion = v; return this; }
        public AbTestBuilder variantBConversion(Double v) { t.variantBConversion = v; return this; }
        public AbTestBuilder variantATraffic(Integer v) { t.variantATraffic = v; return this; }
        public AbTestBuilder variantBTraffic(Integer v) { t.variantBTraffic = v; return this; }
        public AbTestBuilder variantAOrders(Integer v) { t.variantAOrders = v; return this; }
        public AbTestBuilder variantBOrders(Integer v) { t.variantBOrders = v; return this; }
        public AbTestBuilder productId(String v) { t.productId = v; return this; }
        public AbTestBuilder productTitle(String v) { t.productTitle = v; return this; }
        public AbTestBuilder significanceLevel(Double v) { t.significanceLevel = v; return this; }
        public AbTestBuilder targetDays(Integer v) { t.targetDays = v; return this; }
        public AbTestBuilder winner(String v) { t.winner = v; return this; }
        public AbTestBuilder insight(String v) { t.insight = v; return this; }
        public AbTest build() { return t; }
    }
}