// src/main/java/com/smart_freshness_backend/entity/User.java
package com.smart_freshness_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String roles; // Added: e.g., "ROLE_USER" or "ROLE_USER,ROLE_ADMIN"

    private String phoneNumber; // For SMS alerts

    private LocalDateTime createdAt;
}