package com.optivise.repository;

import com.optivise.model.AiSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AiSuggestionRepository extends JpaRepository<AiSuggestion, Long> {
    List<AiSuggestion> findByShopOrderByCreatedAtDesc(String shop);
    List<AiSuggestion> findByShopAndAppliedFalseOrderByCreatedAtDesc(String shop);
    long countByShopAndAppliedFalse(String shop);
}
