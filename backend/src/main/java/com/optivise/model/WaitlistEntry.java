package com.optivise.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "waitlist_entries")
public class WaitlistEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String struggle;   // optional: the user's biggest Shopify struggle (doubles as feedback)

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public WaitlistEntry() {}

    public WaitlistEntry(String email, String struggle) {
        this.email = email;
        this.struggle = struggle;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getStruggle() { return struggle; }
    public void setStruggle(String struggle) { this.struggle = struggle; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}