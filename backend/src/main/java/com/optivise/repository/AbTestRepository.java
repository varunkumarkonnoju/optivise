package com.optivise.repository;

import com.optivise.model.AbTest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AbTestRepository extends JpaRepository<AbTest, Long> {
    List<AbTest> findByShopOrderByStartedAtDesc(String shop);
    List<AbTest> findByShopAndStatus(String shop, String status);
}
