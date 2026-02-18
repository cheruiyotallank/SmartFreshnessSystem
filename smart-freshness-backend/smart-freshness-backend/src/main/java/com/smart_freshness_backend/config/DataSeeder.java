package com.smart_freshness_backend.config;

import com.smart_freshness_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * DataSeeder creates an initial admin user on first startup if no admin exists.
 * 
 * This component runs after the application context is fully initialized.
 * It checks if any user with ROLE_ADMIN exists in the database.
 * If no admin exists, it creates one using the configured credentials.
 * 
 * In production, set these environment variables:
 * - ADMIN_EMAIL: The admin's email address
 * - ADMIN_PASSWORD: The admin's password (use a strong password!)
 * - ADMIN_NAME: The admin's display name
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserService userService;

    @Value("${app.admin.email:admin@smartfresh.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin123!}")
    private String adminPassword;

    @Value("${app.admin.name:System Admin}")
    private String adminName;

    @Override
    public void run(String... args) {
        seedInitialAdmin();
    }

    /**
     * Seeds the initial admin user if no admin exists.
     */
    private void seedInitialAdmin() {
        try {
            if (!userService.adminExists()) {
                log.info("No admin user found. Creating initial admin...");
                userService.createInitialAdmin(adminEmail, adminPassword, adminName);
                log.info("Initial admin created successfully with email: {}", adminEmail);
                log.warn("IMPORTANT: Please change the default admin password after first login!");
            } else {
                log.info("Admin user already exists. Skipping initial admin creation.");
            }
        } catch (Exception e) {
            log.error("Failed to seed initial admin: {}", e.getMessage());
        }
    }
}
