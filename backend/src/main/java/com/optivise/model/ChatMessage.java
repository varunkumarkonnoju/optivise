package com.optivise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String shop;
    private String role;
    @Column(columnDefinition = "TEXT")
    private String content;
    private LocalDateTime createdAt;

    public ChatMessage() {}
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getShop() { return shop; }
    public void setShop(String shop) { this.shop = shop; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static ChatMessageBuilder builder() { return new ChatMessageBuilder(); }
    public static class ChatMessageBuilder {
        private ChatMessage m = new ChatMessage();
        public ChatMessageBuilder shop(String v) { m.shop = v; return this; }
        public ChatMessageBuilder role(String v) { m.role = v; return this; }
        public ChatMessageBuilder content(String v) { m.content = v; return this; }
        public ChatMessage build() { return m; }
    }
}
