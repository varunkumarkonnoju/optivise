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
    private String status;
    private String elementType;
    private String variantALabel;
    private String variantBLabel;
    private Double variantAConversion;
    private Double variantBConversion;
    private Integer variantATraffic;
    private Integer variantBTraffic;
    private String winner;
    private String insight;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    public AbTest() {}
    @PrePersist void onCreate() { startedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getShop() { return shop; }
    public void setShop(String shop) { this.shop = shop; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getElementType() { return elementType; }
    public void setElementType(String elementType) { this.elementType = elementType; }
    public String getVariantALabel() { return variantALabel; }
    public void setVariantALabel(String v) { this.variantALabel = v; }
    public String getVariantBLabel() { return variantBLabel; }
    public void setVariantBLabel(String v) { this.variantBLabel = v; }
    public Double getVariantAConversion() { return variantAConversion; }
    public void setVariantAConversion(Double v) { this.variantAConversion = v; }
    public Double getVariantBConversion() { return variantBConversion; }
    public void setVariantBConversion(Double v) { this.variantBConversion = v; }
    public Integer getVariantATraffic() { return variantATraffic; }
    public void setVariantATraffic(Integer v) { this.variantATraffic = v; }
    public Integer getVariantBTraffic() { return variantBTraffic; }
    public void setVariantBTraffic(Integer v) { this.variantBTraffic = v; }
    public String getWinner() { return winner; }
    public void setWinner(String winner) { this.winner = winner; }
    public String getInsight() { return insight; }
    public void setInsight(String insight) { this.insight = insight; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime v) { this.startedAt = v; }
    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime v) { this.endedAt = v; }

    public static AbTestBuilder builder() { return new AbTestBuilder(); }
    public static class AbTestBuilder {
        private AbTest t = new AbTest();
        public AbTestBuilder shop(String v) { t.shop = v; return this; }
        public AbTestBuilder name(String v) { t.name = v; return this; }
        public AbTestBuilder status(String v) { t.status = v; return this; }
        public AbTestBuilder elementType(String v) { t.elementType = v; return this; }
        public AbTestBuilder variantALabel(String v) { t.variantALabel = v; return this; }
        public AbTestBuilder variantBLabel(String v) { t.variantBLabel = v; return this; }
        public AbTestBuilder variantAConversion(Double v) { t.variantAConversion = v; return this; }
        public AbTestBuilder variantBConversion(Double v) { t.variantBConversion = v; return this; }
        public AbTestBuilder variantATraffic(Integer v) { t.variantATraffic = v; return this; }
        public AbTestBuilder variantBTraffic(Integer v) { t.variantBTraffic = v; return this; }
        public AbTestBuilder winner(String v) { t.winner = v; return this; }
        public AbTestBuilder insight(String v) { t.insight = v; return this; }
        public AbTestBuilder startedAt(LocalDateTime v) { t.startedAt = v; return this; }
        public AbTestBuilder endedAt(LocalDateTime v) { t.endedAt = v; return this; }
        public AbTest build() { return t; }
    }
}
