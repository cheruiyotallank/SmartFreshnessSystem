package com.smart_freshness_backend.service;

import com.smart_freshness_backend.dto.AuthRequest;
import com.smart_freshness_backend.dto.AuthResponse;
import com.smart_freshness_backend.dto.SignupRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * AuthService delegates to UserService for authentication operations.
 * This service exists for semantic clarity and potential future expansion.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;

    /**
     * Register a new user.
     */
    public AuthResponse signup(SignupRequest request) {
        return userService.signup(request);
    }

    /**
     * Authenticate user credentials.
     */
    public AuthResponse login(AuthRequest request) {
        return userService.login(request);
    }
}
