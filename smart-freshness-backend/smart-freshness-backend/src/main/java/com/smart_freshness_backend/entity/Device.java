// Device.java
package com.smart_freshness_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Device {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String deviceId; // e.g. "ESP32-001"

    private String name;
    private String location;

    private LocalDateTime lastSeen;

    /**
     * Check if device is online (seen within last 5 minutes)
     */
    public boolean isOnline() {
        if (lastSeen == null)
            return false;
        return lastSeen.isAfter(LocalDateTime.now().minusMinutes(5));
    }
}
