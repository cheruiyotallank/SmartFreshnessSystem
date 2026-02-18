package com.smart_freshness_backend.repository;

import com.smart_freshness_backend.entity.AlertConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlertConfigRepository extends JpaRepository<AlertConfig, Long> {

    Optional<AlertConfig> findByConfigKey(String configKey);

    default AlertConfig getGlobalConfig() {
        return findByConfigKey("GLOBAL")
                .orElseGet(() -> save(AlertConfig.builder()
                        .configKey("GLOBAL")
                        .freshnessThreshold(60)
                        .cooldownMinutes(30)
                        .build()));
    }
}
