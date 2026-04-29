package com.optivise.dto;
import java.util.List;
import java.util.Map;

public class AnalyticsDTO {
    private List<MetricPoint> daily;
    private Double totalRevenue, avgConversion, avgOrderValue, revenueGrowth, bestDayRevenue, retentionRate;
    private Long totalSessions, totalOrders, repeatCustomers, totalCustomers;
    private String bestDay, bestDayOfWeek;
    private List<Map<String, Object>> topProductsByRevenue;
    private Map<String, Object> conversionFunnel;

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
    public Double getRetentionRate() { return retentionRate; }
    public void setRetentionRate(Double v) { retentionRate = v; }
    public Long getRepeatCustomers() { return repeatCustomers; }
    public void setRepeatCustomers(Long v) { repeatCustomers = v; }
    public Long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(Long v) { totalCustomers = v; }
    public String getBestDayOfWeek() { return bestDayOfWeek; }
    public void setBestDayOfWeek(String v) { bestDayOfWeek = v; }
    public List<Map<String, Object>> getTopProductsByRevenue() { return topProductsByRevenue; }
    public void setTopProductsByRevenue(List<Map<String, Object>> v) { topProductsByRevenue = v; }
    public Map<String, Object> getConversionFunnel() { return conversionFunnel; }
    public void setConversionFunnel(Map<String, Object> v) { conversionFunnel = v; }
}