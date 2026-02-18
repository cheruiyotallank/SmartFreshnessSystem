package com.smart_freshness_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_reading", indexes = {
    @Index(name = "idx_unit_timestamp", columnList = "unit_id, timestamp DESC"),
    @Index(name = "idx_device_timestamp", columnList = "device_id, timestamp DESC")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorReading {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @Column(nullable = false)
    private Double voc;              // Volatile Organic Compounds (ppm)
    
    @Column(nullable = false)
    private Double temperature;       // Celsius
    
    @Column(nullable = false)
    private Double humidity;          // Percentage
    
    @Column(nullable = false)
    private Integer freshnessScore;   // 0-100
    
    @Column(nullable = false)
    private Double computedPrice;     // Dynamically calculated price
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
