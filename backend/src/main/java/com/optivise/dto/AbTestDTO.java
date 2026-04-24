package com.optivise.dto;
import java.time.LocalDateTime;
public class AbTestDTO {
    private Long id; private String name, status, elementType;
    private String variantALabel, variantBLabel;
    private Double variantAConversion, variantBConversion;
    private Integer variantATraffic, variantBTraffic;
    private String winner, insight; private LocalDateTime startedAt;
    public AbTestDTO() {}
    public Long getId() { return id; } public void setId(Long v) { id = v; }
    public String getName() { return name; } public void setName(String v) { name = v; }
    public String getStatus() { return status; } public void setStatus(String v) { status = v; }
    public String getElementType() { return elementType; } public void setElementType(String v) { elementType = v; }
    public String getVariantALabel() { return variantALabel; } public void setVariantALabel(String v) { variantALabel = v; }
    public String getVariantBLabel() { return variantBLabel; } public void setVariantBLabel(String v) { variantBLabel = v; }
    public Double getVariantAConversion() { return variantAConversion; } public void setVariantAConversion(Double v) { variantAConversion = v; }
    public Double getVariantBConversion() { return variantBConversion; } public void setVariantBConversion(Double v) { variantBConversion = v; }
    public Integer getVariantATraffic() { return variantATraffic; } public void setVariantATraffic(Integer v) { variantATraffic = v; }
    public Integer getVariantBTraffic() { return variantBTraffic; } public void setVariantBTraffic(Integer v) { variantBTraffic = v; }
    public String getWinner() { return winner; } public void setWinner(String v) { winner = v; }
    public String getInsight() { return insight; } public void setInsight(String v) { insight = v; }
    public LocalDateTime getStartedAt() { return startedAt; } public void setStartedAt(LocalDateTime v) { startedAt = v; }
    public static AbTestDTOBuilder builder() { return new AbTestDTOBuilder(); }
    public static class AbTestDTOBuilder {
        private AbTestDTO d = new AbTestDTO();
        public AbTestDTOBuilder id(Long v) { d.id = v; return this; }
        public AbTestDTOBuilder name(String v) { d.name = v; return this; }
        public AbTestDTOBuilder status(String v) { d.status = v; return this; }
        public AbTestDTOBuilder elementType(String v) { d.elementType = v; return this; }
        public AbTestDTOBuilder variantALabel(String v) { d.variantALabel = v; return this; }
        public AbTestDTOBuilder variantBLabel(String v) { d.variantBLabel = v; return this; }
        public AbTestDTOBuilder variantAConversion(Double v) { d.variantAConversion = v; return this; }
        public AbTestDTOBuilder variantBConversion(Double v) { d.variantBConversion = v; return this; }
        public AbTestDTOBuilder variantATraffic(Integer v) { d.variantATraffic = v; return this; }
        public AbTestDTOBuilder variantBTraffic(Integer v) { d.variantBTraffic = v; return this; }
        public AbTestDTOBuilder winner(String v) { d.winner = v; return this; }
        public AbTestDTOBuilder insight(String v) { d.insight = v; return this; }
        public AbTestDTOBuilder startedAt(LocalDateTime v) { d.startedAt = v; return this; }
        public AbTestDTO build() { return d; }
    }
}
