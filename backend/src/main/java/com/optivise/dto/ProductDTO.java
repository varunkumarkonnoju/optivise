package com.optivise.dto;
public class ProductDTO {
    private Long id; private String title, optimizationStatus, imageUrl;
    private Double price, revenue, conversionRate; private Integer sessions;
    public ProductDTO() {}
    public Long getId() { return id; } public void setId(Long v) { id = v; }
    public String getTitle() { return title; } public void setTitle(String v) { title = v; }
    public Double getPrice() { return price; } public void setPrice(Double v) { price = v; }
    public Double getRevenue() { return revenue; } public void setRevenue(Double v) { revenue = v; }
    public Integer getSessions() { return sessions; } public void setSessions(Integer v) { sessions = v; }
    public Double getConversionRate() { return conversionRate; } public void setConversionRate(Double v) { conversionRate = v; }
    public String getOptimizationStatus() { return optimizationStatus; } public void setOptimizationStatus(String v) { optimizationStatus = v; }
    public String getImageUrl() { return imageUrl; } public void setImageUrl(String v) { imageUrl = v; }
    public static ProductDTOBuilder builder() { return new ProductDTOBuilder(); }
    public static class ProductDTOBuilder {
        private ProductDTO d = new ProductDTO();
        public ProductDTOBuilder id(Long v) { d.id = v; return this; }
        public ProductDTOBuilder title(String v) { d.title = v; return this; }
        public ProductDTOBuilder price(Double v) { d.price = v; return this; }
        public ProductDTOBuilder revenue(Double v) { d.revenue = v; return this; }
        public ProductDTOBuilder sessions(Integer v) { d.sessions = v; return this; }
        public ProductDTOBuilder conversionRate(Double v) { d.conversionRate = v; return this; }
        public ProductDTOBuilder optimizationStatus(String v) { d.optimizationStatus = v; return this; }
        public ProductDTOBuilder imageUrl(String v) { d.imageUrl = v; return this; }
        public ProductDTO build() { return d; }
    }
}
