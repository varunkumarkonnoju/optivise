package com.optivise.dto;
import java.time.LocalDateTime;
public class ChatMessageDTO {
    private String role, content;
    private LocalDateTime createdAt;
    public ChatMessageDTO() {}
    public String getRole() { return role; } public void setRole(String v) { role = v; }
    public String getContent() { return content; } public void setContent(String v) { content = v; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime v) { createdAt = v; }
    public static ChatMessageDTOBuilder builder() { return new ChatMessageDTOBuilder(); }
    public static class ChatMessageDTOBuilder {
        private ChatMessageDTO d = new ChatMessageDTO();
        public ChatMessageDTOBuilder role(String v) { d.role = v; return this; }
        public ChatMessageDTOBuilder content(String v) { d.content = v; return this; }
        public ChatMessageDTOBuilder createdAt(LocalDateTime v) { d.createdAt = v; return this; }
        public ChatMessageDTO build() { return d; }
    }
}
