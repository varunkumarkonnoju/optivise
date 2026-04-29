package com.optivise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String shop;
    private String notifId; // unique key like "low-stock-leather-jacket"
    private String type;
    private String icon;
    private String title;
    @Column(length = 500)
    private String message;
    private String color;
    private String actionUrl;
    private boolean isNew = true;
    private boolean dismissed = false;
    private int priority = 0; // Higher = shown first
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() { createdAt = LocalDateTime.now(); }

    // Getters and setters
    public Long getId() { return id; }
    public String getShop() { return shop; }
    public void setShop(String v) { this.shop = v; }
    public String getNotifId() { return notifId; }
    public void setNotifId(String v) { this.notifId = v; }
    public String getType() { return type; }
    public void setType(String v) { this.type = v; }
    public String getIcon() { return icon; }
    public void setIcon(String v) { this.icon = v; }
    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v; }
    public String getMessage() { return message; }
    public void setMessage(String v) { this.message = v; }
    public String getColor() { return color; }
    public void setColor(String v) { this.color = v; }
    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String v) { this.actionUrl = v; }
    public boolean isNew() { return isNew; }
    public void setNew(boolean v) { this.isNew = v; }
    public boolean isDismissed() { return dismissed; }
    public int getPriority() { return priority; }
    public void setPriority(int v) { this.priority = v; }
    public void setDismissed(boolean v) { this.dismissed = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
}