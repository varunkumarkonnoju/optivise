package com.optivise.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "description_backups")
public class DescriptionBackup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String shopDomain;

    private String productId;

    private String productTitle;

    @Column(columnDefinition = "TEXT")
    private String originalDescription;

    @Column(columnDefinition = "TEXT")
    private String aiDescription;

    private Instant savedAt;

    private boolean restored = false;

    // Constructors
    public DescriptionBackup() {}

    public DescriptionBackup(String shopDomain, String productId,
                             String productTitle, String originalDescription,
                             String aiDescription) {
        this.shopDomain = shopDomain;
        this.productId = productId;
        this.productTitle = productTitle;
        this.originalDescription = originalDescription;
        this.aiDescription = aiDescription;
        this.savedAt = Instant.now();
        this.restored = false;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getShopDomain() { return shopDomain; }
    public void setShopDomain(String shopDomain) { this.shopDomain = shopDomain; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }
    public String getOriginalDescription() { return originalDescription; }
    public void setOriginalDescription(String originalDescription) { this.originalDescription = originalDescription; }
    public String getAiDescription() { return aiDescription; }
    public void setAiDescription(String aiDescription) { this.aiDescription = aiDescription; }
    public Instant getSavedAt() { return savedAt; }
    public void setSavedAt(Instant savedAt) { this.savedAt = savedAt; }
    public boolean isRestored() { return restored; }
    public void setRestored(boolean restored) { this.restored = restored; }
}