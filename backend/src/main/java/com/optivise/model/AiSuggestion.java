package com.optivise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_suggestions")
public class AiSuggestion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String shop;
    private String title;
    private String description;
    private String impact;
    private String category;
    private Boolean applied;
    private LocalDateTime createdAt;

    public AiSuggestion() {}

    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getShop() { return shop; }
    public void setShop(String shop) { this.shop = shop; }
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

    public static AiSuggestionBuilder builder() { return new AiSuggestionBuilder(); }
    public static class AiSuggestionBuilder {
        private AiSuggestion s = new AiSuggestion();
        public AiSuggestionBuilder shop(String v) { s.shop = v; return this; }
        public AiSuggestionBuilder title(String v) { s.title = v; return this; }
        public AiSuggestionBuilder description(String v) { s.description = v; return this; }
        public AiSuggestionBuilder impact(String v) { s.impact = v; return this; }
        public AiSuggestionBuilder category(String v) { s.category = v; return this; }
        public AiSuggestionBuilder applied(Boolean v) { s.applied = v; return this; }
        public AiSuggestion build() { return s; }
    }
}
