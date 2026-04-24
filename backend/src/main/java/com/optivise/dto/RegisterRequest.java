package com.optivise.dto;
public class RegisterRequest {
    private String name, email, password, shopDomain;
    public RegisterRequest() {}
    public String getName() { return name; } public void setName(String v) { name = v; }
    public String getEmail() { return email; } public void setEmail(String v) { email = v; }
    public String getPassword() { return password; } public void setPassword(String v) { password = v; }
    public String getShopDomain() { return shopDomain; } public void setShopDomain(String v) { shopDomain = v; }
}
