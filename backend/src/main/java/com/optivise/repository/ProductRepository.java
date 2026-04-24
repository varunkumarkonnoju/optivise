package com.optivise.repository;

import com.optivise.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByShopOrderByRevenueDesc(String shop);
    List<Product> findByShopAndOptimizationStatus(String shop, String status);
}
