package com.optivise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "suggestions")
public class Suggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String shop;
    private String suggestionKey; // unique key per suggestion type
    private String type;
    private String priority;
    private String title;
    @Column(length = 500)
    private String description;
    private String impact;
    private String effort;
    private String action;
    private String actionLabel;
    private String productId;
    private String productTitle;
    private boolean applied = false;
    private boolean dismissed = false;
    private int priorityOrder = 0;
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public String getShop() { return shop; }
    public void setShop(String v) { this.shop = v; }
    public String getSuggestionKey() { return suggestionKey; }
    public void setSuggestionKey(String v) { this.suggestionKey = v; }
    public String getType() { return type; }
    public void setType(String v) { this.type = v; }
    public String getPriority() { return priority; }
    public void setPriority(String v) { this.priority = v; }
    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public String getImpact() { return impact; }
    public void setImpact(String v) { this.impact = v; }
    public String getEffort() { return effort; }
    public void setEffort(String v) { this.effort = v; }
    public String getAction() { return action; }
    public void setAction(String v) { this.action = v; }
    public String getActionLabel() { return actionLabel; }
    public void setActionLabel(String v) { this.actionLabel = v; }
    public String getProductId() { return productId; }
    public void setProductId(String v) { this.productId = v; }
    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String v) { this.productTitle = v; }
    public boolean isApplied() { return applied; }
    public void setApplied(boolean v) { this.applied = v; }
    public boolean isDismissed() { return dismissed; }
    public void setDismissed(boolean v) { this.dismissed = v; }
    public int getPriorityOrder() { return priorityOrder; }
    public void setPriorityOrder(int v) { this.priorityOrder = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
}