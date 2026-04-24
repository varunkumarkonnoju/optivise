package com.optivise.repository;

import com.optivise.model.MetricSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface MetricSnapshotRepository extends JpaRepository<MetricSnapshot, Long> {
    List<MetricSnapshot> findByShopOrderByDateDesc(String shop);

    @Query("SELECT m FROM MetricSnapshot m WHERE m.shop = :shop ORDER BY m.date DESC LIMIT 30")
    List<MetricSnapshot> findLast30Days(String shop);
}
