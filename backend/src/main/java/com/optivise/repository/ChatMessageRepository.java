package com.optivise.repository;

import com.optivise.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByShopOrderByCreatedAtAsc(String shop);

    @Query("SELECT c FROM ChatMessage c WHERE c.shop = :shop ORDER BY c.createdAt DESC LIMIT 20")
    List<ChatMessage> findRecentByShop(String shop);

    @Modifying
    @Transactional
    @Query("DELETE FROM ChatMessage c WHERE c.shop = :shop")
    void deleteByShop(String shop);
}