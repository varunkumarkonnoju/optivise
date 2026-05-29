package com.optivise.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Persisted password-reset token. Replaces the previous in-memory map so reset
 * links survive restarts and work across multiple instances. Only a SHA-256 hash
 * of the token is stored, so a database read cannot reveal a usable reset link.
 */
@Entity
@Table(name = "password_reset_tokens",
        indexes = @Index(name = "idx_prt_token_hash", columnList = "tokenHash", unique = true))
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String tokenHash;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private Instant expiresAt;

    public PasswordResetToken() {}

    public PasswordResetToken(String tokenHash, String email, Instant expiresAt) {
        this.tokenHash = tokenHash;
        this.email = email;
        this.expiresAt = expiresAt;
    }

    public boolean isExpired() {
        return expiresAt == null || Instant.now().isAfter(expiresAt);
    }

    public Long getId() { return id; }
    public String getTokenHash() { return tokenHash; }
    public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}