package com.optivise.dto;

import java.time.LocalDateTime;

public class SuggestionDTO {
    private Long id;
    private String title;
    private String description;
    private String impact;
    private String category;
    private Boolean applied;
    private LocalDateTime createdAt;

    public SuggestionDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImpact() { return impact; }
    public void setImpact(String impact) { this.impact = impact; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Boolean getApplied() { return applied; }
    public void setApplied(Boolean applied) { this.applied = applied; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
