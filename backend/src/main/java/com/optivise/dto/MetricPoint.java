package com.optivise.dto;

public class MetricPoint {
    private String label;
    private Double revenue;
    private Double conversion;
    private Long sessions;

    public MetricPoint() {}

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public Double getRevenue() { return revenue; }
    public void setRevenue(Double revenue) { this.revenue = revenue; }

    public Double getConversion() { return conversion; }
    public void setConversion(Double conversion) { this.conversion = conversion; }

    public Long getSessions() { return sessions; }
    public void setSessions(Long sessions) { this.sessions = sessions; }

    public static MetricPoint of(String label, Double revenue, Double conversion, Long sessions) {
        MetricPoint mp = new MetricPoint();
        mp.label = label; mp.revenue = revenue;
        mp.conversion = conversion; mp.sessions = sessions;
        return mp;
    }
}
