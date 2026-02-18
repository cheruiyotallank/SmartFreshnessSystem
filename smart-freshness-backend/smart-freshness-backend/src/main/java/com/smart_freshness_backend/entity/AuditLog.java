package com.smart_freshness_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log", indexes = {
        @Index(name = "idx_audit_entity", columnList = "entityType, entityId"),
        @Index(name = "idx_audit_timestamp", columnList = "timestamp DESC"),
        @Index(name = "idx_audit_user", columnList = "userId")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String entityType; // "PRODUCT", "UNIT", "ALERT_CONFIG", "USER"

    @Column(nullable = false)
    private Long entityId;

    @Column(nullable = false)
    private String action; // "CREATE", "UPDATE", "DELETE"

    @Column(length = 2000)
    private String oldValue; // JSON string of old values

    @Column(length = 2000)
    private String newValue; // JSON string of new values

    @Column
    private Long userId;

    @Column
    private String userName;

    @Column
    private String userEmail;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(length = 500)
    private String description; // Human-readable description of the change
}
