package com.optivise.dto;
import java.time.LocalDateTime;

public class AbTestDTO {
    private Long id;
    private String name, status, elementType;
    private String variantALabel, variantBLabel;
    private String variantADescription, variantBDescription;
    private Double variantAConversion, variantBConversion;
    private Integer variantATraffic, variantBTraffic;
    private Integer variantAOrders, variantBOrders;
    private String winner, insight, productId, productTitle;
    private Double significanceLevel;
    private Integer targetDays;
    private LocalDateTime startedAt, endedAt;

    public AbTestDTO() {}

    public Long getId() { return id; } public void setId(Long v) { id = v; }
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
    public Integer getVariantAOrders() { return variantAOrders; } public void setVariantAOrders(Integer v) { variantAOrders = v; }
    public Integer getVariantBOrders() { return variantBOrders; } public void setVariantBOrders(Integer v) { variantBOrders = v; }
    public String getWinner() { return winner; } public void setWinner(String v) { winner = v; }
    public String getInsight() { return insight; } public void setInsight(String v) { insight = v; }
    public String getProductId() { return productId; } public void setProductId(String v) { productId = v; }
    public String getProductTitle() { return productTitle; } public void setProductTitle(String v) { productTitle = v; }
    public Double getSignificanceLevel() { return significanceLevel; } public void setSignificanceLevel(Double v) { significanceLevel = v; }
    public Integer getTargetDays() { return targetDays; } public void setTargetDays(Integer v) { targetDays = v; }
    public LocalDateTime getStartedAt() { return startedAt; } public void setStartedAt(LocalDateTime v) { startedAt = v; }
    public LocalDateTime getEndedAt() { return endedAt; } public void setEndedAt(LocalDateTime v) { endedAt = v; }

    public static AbTestDTOBuilder builder() { return new AbTestDTOBuilder(); }
    public static class AbTestDTOBuilder {
        private AbTestDTO d = new AbTestDTO();
        public AbTestDTOBuilder id(Long v) { d.id = v; return this; }
        public AbTestDTOBuilder name(String v) { d.name = v; return this; }
        public AbTestDTOBuilder status(String v) { d.status = v; return this; }
        public AbTestDTOBuilder elementType(String v) { d.elementType = v; return this; }
        public AbTestDTOBuilder variantALabel(String v) { d.variantALabel = v; return this; }
        public AbTestDTOBuilder variantBLabel(String v) { d.variantBLabel = v; return this; }
        public AbTestDTOBuilder variantADescription(String v) { d.variantADescription = v; return this; }
        public AbTestDTOBuilder variantBDescription(String v) { d.variantBDescription = v; return this; }
        public AbTestDTOBuilder variantAConversion(Double v) { d.variantAConversion = v; return this; }
        public AbTestDTOBuilder variantBConversion(Double v) { d.variantBConversion = v; return this; }
        public AbTestDTOBuilder variantATraffic(Integer v) { d.variantATraffic = v; return this; }
        public AbTestDTOBuilder variantBTraffic(Integer v) { d.variantBTraffic = v; return this; }
        public AbTestDTOBuilder variantAOrders(Integer v) { d.variantAOrders = v; return this; }
        public AbTestDTOBuilder variantBOrders(Integer v) { d.variantBOrders = v; return this; }
        public AbTestDTOBuilder winner(String v) { d.winner = v; return this; }
        public AbTestDTOBuilder insight(String v) { d.insight = v; return this; }
        public AbTestDTOBuilder productId(String v) { d.productId = v; return this; }
        public AbTestDTOBuilder productTitle(String v) { d.productTitle = v; return this; }
        public AbTestDTOBuilder significanceLevel(Double v) { d.significanceLevel = v; return this; }
        public AbTestDTOBuilder targetDays(Integer v) { d.targetDays = v; return this; }
        public AbTestDTOBuilder startedAt(LocalDateTime v) { d.startedAt = v; return this; }
        public AbTestDTOBuilder endedAt(LocalDateTime v) { d.endedAt = v; return this; }
        public AbTestDTO build() { return d; }
    }
}