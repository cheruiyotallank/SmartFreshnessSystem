package com.smart_freshness_backend.service;

import com.smart_freshness_backend.dto.AuthRequest;
import com.smart_freshness_backend.dto.AuthResponse;
import com.smart_freshness_backend.dto.SignupRequest;
import com.smart_freshness_backend.entity.User;
import com.smart_freshness_backend.exception.ResourceNotFoundException;
import com.smart_freshness_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Register a new user account.
     * All new users are registered with ROLE_USER.
     * Admin roles are assigned through the promoteToAdmin method by existing
     * admins.
     */
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        // All new users get ROLE_USER - admins are promoted via admin dashboard
        String role = "ROLE_USER";

        // Create and save user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(role)
                .createdAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {} with role {}", user.getEmail(), role);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRoles());

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRoles());
    }

    /**
     * Authenticate user and return JWT token.
     */
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRoles());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRoles());
    }

    /**
     * Promote a user to admin role.
     * This should only be called by authenticated admins.
     */
    @Transactional
    public User promoteToAdmin(Long userId) {
        User user = getUserById(userId);

        if ("ROLE_ADMIN".equals(user.getRoles())) {
            throw new RuntimeException("User is already an admin");
        }

        user.setRoles("ROLE_ADMIN");
        user = userRepository.save(user);
        log.info("User {} promoted to admin", user.getEmail());

        return user;
    }

    /**
     * Demote an admin to regular user role.
     * This should only be called by authenticated admins.
     * Admins cannot demote themselves.
     */
    @Transactional
    public User demoteToUser(Long userId, String currentUserEmail) {
        User user = getUserById(userId);

        // Prevent admin from demoting themselves
        if (user.getEmail().equals(currentUserEmail)) {
            throw new RuntimeException("You cannot demote yourself");
        }

        if ("ROLE_USER".equals(user.getRoles())) {
            throw new RuntimeException("User is already a regular user");
        }

        user.setRoles("ROLE_USER");
        user = userRepository.save(user);
        log.info("User {} demoted to regular user", user.getEmail());

        return user;
    }

    /**
     * Get all users.
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get user by ID.
     */
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    /**
     * Get user by email.
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    /**
     * Update user details.
     */
    @Transactional
    public User updateUser(Long id, User updatedUser) {
        User user = getUserById(id);

        if (updatedUser.getName() != null) {
            user.setName(updatedUser.getName());
        }

        if (updatedUser.getEmail() != null && !updatedUser.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updatedUser.getEmail())) {
                throw new RuntimeException("Email already exists: " + updatedUser.getEmail());
            }
            user.setEmail(updatedUser.getEmail());
        }

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        if (updatedUser.getRoles() != null) {
            user.setRoles(updatedUser.getRoles());
        }

        return userRepository.save(user);
    }

    /**
     * Delete user by ID.
     */
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    /**
     * Count total users.
     */
    public long countUsers() {
        return userRepository.count();
    }

    /**
     * Check if any admin user exists in the system.
     * Used by DataSeeder to determine if initial admin should be created.
     */
    public boolean adminExists() {
        return userRepository.findAll().stream()
                .anyMatch(user -> "ROLE_ADMIN".equals(user.getRoles()));
    }

    /**
     * Create initial admin user.
     * Used by DataSeeder on first startup.
     */
    @Transactional
    public User createInitialAdmin(String email, String password, String name) {
        if (userRepository.existsByEmail(email)) {
            log.info("Admin email already exists, skipping creation");
            return userRepository.findByEmail(email).orElse(null);
        }

        User admin = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .roles("ROLE_ADMIN")
                .createdAt(LocalDateTime.now())
                .build();

        admin = userRepository.save(admin);
        log.info("Initial admin user created: {}", email);

        return admin;
    }
}
