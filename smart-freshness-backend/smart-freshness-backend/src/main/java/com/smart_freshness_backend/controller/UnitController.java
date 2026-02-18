package com.smart_freshness_backend.controller;

import com.smart_freshness_backend.entity.Unit;
import com.smart_freshness_backend.service.UnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    /**
     * Get all units (public)
     */
    @GetMapping
    public ResponseEntity<List<Unit>> getAllUnits() {
        return ResponseEntity.ok(unitService.getAllUnits());
    }

    /**
     * Get unit by ID (public)
     */
    @GetMapping("/{id}")
    public ResponseEntity<Unit> getUnit(@PathVariable Long id) {
        return ResponseEntity.ok(unitService.getUnitById(id));
    }

    /**
     * Create a new unit (admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createUnit(@RequestBody Unit unit) {
        try {
            Unit created = unitService.createUnit(unit);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Unit created successfully");
            response.put("data", created);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update a unit (admin only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateUnit(
            @PathVariable Long id,
            @RequestBody Unit unit) {
        try {
            Unit updated = unitService.updateUnit(id, unit);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Unit updated successfully");
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update unit inventory count
     */
    @PatchMapping("/{id}/inventory")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateInventory(
            @PathVariable Long id,
            @RequestParam int count) {
        try {
            Unit updated = unitService.updateInventory(id, count);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Inventory updated to: " + count);
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Delete a unit (admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteUnit(@PathVariable Long id) {
        try {
            unitService.deleteUnit(id);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Unit deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get unit count
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countUnits() {
        return ResponseEntity.ok(unitService.countUnits());
    }
}