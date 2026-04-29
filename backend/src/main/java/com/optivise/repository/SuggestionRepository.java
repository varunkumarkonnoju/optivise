package com.optivise.repository;

import com.optivise.model.Suggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {
    List<Suggestion> findByShopAndDismissedFalseOrderByPriorityOrderDescCreatedAtDesc(String shop);
    Optional<Suggestion> findByShopAndSuggestionKey(String shop, String key);

    @Modifying @Transactional
    @Query("UPDATE Suggestion s SET s.dismissed = true WHERE s.shop = :shop AND s.suggestionKey = :key")
    void dismissByShopAndKey(String shop, String key);

    @Modifying @Transactional
    @Query("UPDATE Suggestion s SET s.applied = true WHERE s.shop = :shop AND s.suggestionKey = :key")
    void applyByShopAndKey(String shop, String key);
}