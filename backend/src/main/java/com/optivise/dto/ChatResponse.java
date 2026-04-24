package com.optivise.dto;
public class ChatResponse {
    private String reply;
    public ChatResponse() {}
    public String getReply() { return reply; } public void setReply(String v) { reply = v; }
    public static ChatResponseBuilder builder() { return new ChatResponseBuilder(); }
    public static class ChatResponseBuilder {
        private ChatResponse r = new ChatResponse();
        public ChatResponseBuilder reply(String v) { r.reply = v; return this; }
        public ChatResponse build() { return r; }
    }
}
