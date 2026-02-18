package com.smart_freshness_backend.repository;

import com.smart_freshness_backend.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    /**
     * Find recent alerts for a unit
     */
    List<Alert> findByUnitIdOrderByCreatedAtDesc(Long unitId);

    /**
     * Find all alerts ordered by creation time
     */
    List<Alert> findAllByOrderByCreatedAtDesc();

    /**
     * Find the latest alert for a unit (to check cooldown)
     */
    Optional<Alert> findTopByUnitIdOrderByCreatedAtDesc(Long unitId);

    /**
     * Find alerts created after a specific time
     */
    List<Alert> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime timestamp);

    /**
     * Count unsent alerts
     */
    long countBySentFalse();
}
