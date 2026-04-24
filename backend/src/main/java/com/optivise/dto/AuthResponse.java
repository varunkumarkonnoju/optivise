package com.optivise.dto;
public class AuthResponse {
    private String token, name, email, shopDomain, role;
    public AuthResponse() {}
    public String getToken() { return token; } public void setToken(String v) { token = v; }
    public String getName() { return name; } public void setName(String v) { name = v; }
    public String getEmail() { return email; } public void setEmail(String v) { email = v; }
    public String getShopDomain() { return shopDomain; } public void setShopDomain(String v) { shopDomain = v; }
    public String getRole() { return role; } public void setRole(String v) { role = v; }
    public static AuthResponseBuilder builder() { return new AuthResponseBuilder(); }
    public static class AuthResponseBuilder {
        private AuthResponse r = new AuthResponse();
        public AuthResponseBuilder token(String v) { r.token = v; return this; }
        public AuthResponseBuilder name(String v) { r.name = v; return this; }
        public AuthResponseBuilder email(String v) { r.email = v; return this; }
        public AuthResponseBuilder shopDomain(String v) { r.shopDomain = v; return this; }
        public AuthResponseBuilder role(String v) { r.role = v; return this; }
        public AuthResponse build() { return r; }
    }
}
