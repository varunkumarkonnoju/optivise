package com.optivise.repository;

import com.optivise.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByShopAndDismissedFalseOrderByPriorityDescCreatedAtDesc(String shop);
    Optional<Notification> findByShopAndNotifId(String shop, String notifId);

    @Modifying @Transactional
    @Query("UPDATE Notification n SET n.dismissed = true WHERE n.shop = :shop AND n.notifId = :notifId")
    void dismissByShopAndNotifId(String shop, String notifId);

    @Modifying @Transactional
    @Query("UPDATE Notification n SET n.dismissed = true WHERE n.shop = :shop")
    void dismissAllByShop(String shop);

    @Modifying @Transactional
    @Query("UPDATE Notification n SET n.isNew = false WHERE n.shop = :shop")
    void markAllReadByShop(String shop);
}