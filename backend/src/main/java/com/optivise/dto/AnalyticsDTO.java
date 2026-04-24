package com.optivise.dto;
import java.util.List;

public class AnalyticsDTO {
    private List<MetricPoint> daily;
    private Double totalRevenue, avgConversion, avgOrderValue, revenueGrowth, bestDayRevenue;
    private Long totalSessions, totalOrders;
    private String bestDay;

    public AnalyticsDTO() {}

    public List<MetricPoint> getDaily() { return daily; }
    public void setDaily(List<MetricPoint> v) { daily = v; }
    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double v) { totalRevenue = v; }
    public Double getAvgConversion() { return avgConversion; }
    public void setAvgConversion(Double v) { avgConversion = v; }
    public Double getAvgOrderValue() { return avgOrderValue; }
    public void setAvgOrderValue(Double v) { avgOrderValue = v; }
    public Double getRevenueGrowth() { return revenueGrowth; }
    public void setRevenueGrowth(Double v) { revenueGrowth = v; }
    public Double getBestDayRevenue() { return bestDayRevenue; }
    public void setBestDayRevenue(Double v) { bestDayRevenue = v; }
    public Long getTotalSessions() { return totalSessions; }
    public void setTotalSessions(Long v) { totalSessions = v; }
    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long v) { totalOrders = v; }
    public String getBestDay() { return bestDay; }
    public void setBestDay(String v) { bestDay = v; }
}