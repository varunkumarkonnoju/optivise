package com.optivise.repository;

import com.optivise.model.DescriptionBackup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DescriptionBackupRepository extends JpaRepository<DescriptionBackup, Long> {

    // Get all backups for a store (for showing restore buttons)
    List<DescriptionBackup> findByShopDomainOrderBySavedAtDesc(String shopDomain);

    // Find specific product backup
    Optional<DescriptionBackup> findByShopDomainAndProductId(String shopDomain, String productId);

    // Get only non-restored backups
    List<DescriptionBackup> findByShopDomainAndRestoredFalseOrderBySavedAtDesc(String shopDomain);
}