package com.optivise.dto;

import java.util.List;


public class DashboardSummary {
    private Double totalRevenue;
    private Double revenueDelta;
    private Double conversionRate;
    private Double conversionDelta;
    private Double avgOrderValue;
    private List<SegmentDTO> customerSegments;
    private Integer totalCustomers;
    private Integer activeAbTests;
    private Integer abTestsDelta;
    private Integer aiSuggestions;
    private Integer aiSuggestionsNew;
    private Integer aiGrowthScore;
    private String growthLabel;
    private List<MetricPoint> revenueChart;
    private List<MetricPoint> conversionChart;
    private List<MetricPoint> sessionsChart;
    private List<ProductSummary> topProducts;
    private List<SuggestionDTO> recommendedActions;

    public DashboardSummary() {}

    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }

    public Double getRevenueDelta() { return revenueDelta; }
    public void setRevenueDelta(Double revenueDelta) { this.revenueDelta = revenueDelta; }

    public Double getConversionRate() { return conversionRate; }
    public void setConversionRate(Double conversionRate) { this.conversionRate = conversionRate; }

    public Double getConversionDelta() { return conversionDelta; }
    public void setConversionDelta(Double conversionDelta) { this.conversionDelta = conversionDelta; }

    public Double getAvgOrderValue() { return avgOrderValue; }
    public void setAvgOrderValue(Double avgOrderValue) { this.avgOrderValue = avgOrderValue; }

    public List<SegmentDTO> getCustomerSegments() { return customerSegments; }
    public void setCustomerSegments(List<SegmentDTO> customerSegments) { this.customerSegments = customerSegments; }

    public Integer getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(Integer totalCustomers) { this.totalCustomers = totalCustomers; }

    public Integer getActiveAbTests() { return activeAbTests; }
    public void setActiveAbTests(Integer activeAbTests) { this.activeAbTests = activeAbTests; }

    public Integer getAbTestsDelta() { return abTestsDelta; }
    public void setAbTestsDelta(Integer abTestsDelta) { this.abTestsDelta = abTestsDelta; }

    public Integer getAiSuggestions() { return aiSuggestions; }
    public void setAiSuggestions(Integer aiSuggestions) { this.aiSuggestions = aiSuggestions; }

    public Integer getAiSuggestionsNew() { return aiSuggestionsNew; }
    public void setAiSuggestionsNew(Integer aiSuggestionsNew) { this.aiSuggestionsNew = aiSuggestionsNew; }

    public Integer getAiGrowthScore() { return aiGrowthScore; }
    public void setAiGrowthScore(Integer aiGrowthScore) { this.aiGrowthScore = aiGrowthScore; }

    public String getGrowthLabel() { return growthLabel; }
    public void setGrowthLabel(String growthLabel) { this.growthLabel = growthLabel; }

    public List<MetricPoint> getRevenueChart() { return revenueChart; }
    public void setRevenueChart(List<MetricPoint> revenueChart) { this.revenueChart = revenueChart; }

    public List<MetricPoint> getConversionChart() { return conversionChart; }
    public void setConversionChart(List<MetricPoint> conversionChart) { this.conversionChart = conversionChart; }

    public List<MetricPoint> getSessionsChart() { return sessionsChart; }
    public void setSessionsChart(List<MetricPoint> sessionsChart) { this.sessionsChart = sessionsChart; }

    public List<ProductSummary> getTopProducts() { return topProducts; }
    public void setTopProducts(List<ProductSummary> topProducts) { this.topProducts = topProducts; }

    public List<SuggestionDTO> getRecommendedActions() { return recommendedActions; }
    public void setRecommendedActions(List<SuggestionDTO> recommendedActions) { this.recommendedActions = recommendedActions; }
}