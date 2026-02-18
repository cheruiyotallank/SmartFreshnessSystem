package com.smart_freshness_backend.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private Long id;
    private String name;
    private String email;
    private String roles;

    public AuthResponse(String token, Long id, String name, String email, String roles) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.roles = roles;
    }
}