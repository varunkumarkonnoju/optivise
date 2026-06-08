package com.optivise.repository;

import com.optivise.model.WaitlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WaitlistEntryRepository extends JpaRepository<WaitlistEntry, Long> {
    Optional<WaitlistEntry> findByEmail(String email);
    boolean existsByEmail(String email);
    long count();
}