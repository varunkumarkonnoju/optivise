package com.optivise.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_settings")
public class UserSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private boolean emailNotifications = true;
    private boolean weeklyReport = true;
    private boolean lowStockAlerts = true;
    private boolean newOrderAlerts = true;
    private boolean aiSuggestions = true;
    private String theme = "dark";
    private String language = "en";
    private String currency = "USD";
    private String timezone = "America/Chicago";

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isEmailNotifications() { return emailNotifications; }
    public void setEmailNotifications(boolean v) { this.emailNotifications = v; }
    public boolean isWeeklyReport() { return weeklyReport; }
    public void setWeeklyReport(boolean v) { this.weeklyReport = v; }
    public boolean isLowStockAlerts() { return lowStockAlerts; }
    public void setLowStockAlerts(boolean v) { this.lowStockAlerts = v; }
    public boolean isNewOrderAlerts() { return newOrderAlerts; }
    public void setNewOrderAlerts(boolean v) { this.newOrderAlerts = v; }
    public boolean isAiSuggestions() { return aiSuggestions; }
    public void setAiSuggestions(boolean v) { this.aiSuggestions = v; }
    public String getTheme() { return theme; }
    public void setTheme(String v) { this.theme = v; }
    public String getLanguage() { return language; }
    public void setLanguage(String v) { this.language = v; }
    public String getCurrency() { return currency; }
    public void setCurrency(String v) { this.currency = v; }
    public String getTimezone() { return timezone; }
    public void setTimezone(String v) { this.timezone = v; }
}