package com.smart_freshness_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "alert_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer freshnessThreshold; // Default: 60

    @Column(nullable = false)
    private Integer cooldownMinutes; // Default: 30

    // Singleton pattern - only one config row
    @Column(name = "config_key", unique = true, nullable = false)
    @Builder.Default
    private String configKey = "GLOBAL";
}
