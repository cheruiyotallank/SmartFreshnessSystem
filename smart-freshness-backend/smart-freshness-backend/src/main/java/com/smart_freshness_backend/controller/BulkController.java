package com.smart_freshness_backend.controller;

import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.smart_freshness_backend.entity.Product;
import com.smart_freshness_backend.entity.Unit;
import com.smart_freshness_backend.service.ProductService;
import com.smart_freshness_backend.service.UnitService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bulk")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class BulkController {

    private final ProductService productService;
    private final UnitService unitService;

    // ==========================================
    // PRODUCT CSV OPERATIONS
    // ==========================================

    /**
     * Export all products to CSV
     */
    @GetMapping("/products/export")
    public void exportProducts(HttpServletResponse response) throws Exception {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"products.csv\"");

        List<Product> products = productService.getAllProducts();

        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(response.getOutputStream()))) {
            // Header
            String[] header = { "id", "name", "category", "description", "imageUrl",
                    "basePrice", "lowSeasonPrice", "midSeasonPrice", "highSeasonPrice", "currentSeason" };
            writer.writeNext(header);

            // Data rows
            for (Product p : products) {
                String[] row = {
                        String.valueOf(p.getId()),
                        p.getName(),
                        p.getCategory(),
                        p.getDescription(),
                        p.getImageUrl(),
                        String.valueOf(p.getBasePrice()),
                        p.getLowSeasonPrice() != null ? String.valueOf(p.getLowSeasonPrice()) : "",
                        p.getMidSeasonPrice() != null ? String.valueOf(p.getMidSeasonPrice()) : "",
                        p.getHighSeasonPrice() != null ? String.valueOf(p.getHighSeasonPrice()) : "",
                        p.getCurrentSeason()
                };
                writer.writeNext(row);
            }
        }
        log.info("Exported {} products to CSV", products.size());
    }

    /**
     * Import products from CSV
     */
    @PostMapping("/products/import")
    public ResponseEntity<Map<String, Object>> importProducts(@RequestParam("file") MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        List<String> errors = new ArrayList<>();
        int imported = 0;
        int updated = 0;

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> rows = reader.readAll();

            if (rows.isEmpty()) {
                result.put("status", "error");
                result.put("message", "CSV file is empty");
                return ResponseEntity.badRequest().body(result);
            }

            // Skip header row
            for (int i = 1; i < rows.size(); i++) {
                String[] row = rows.get(i);
                try {
                    Product product = new Product();

                    // Check if updating existing product (id column present and not empty)
                    Long existingId = null;
                    if (row.length > 0 && !row[0].isEmpty()) {
                        try {
                            existingId = Long.parseLong(row[0].trim());
                        } catch (NumberFormatException ignored) {
                        }
                    }

                    if (row.length > 1)
                        product.setName(row[1].trim());
                    if (row.length > 2)
                        product.setCategory(row[2].trim());
                    if (row.length > 3)
                        product.setDescription(row[3].trim());
                    if (row.length > 4)
                        product.setImageUrl(row[4].trim());
                    if (row.length > 5 && !row[5].isEmpty()) {
                        product.setBasePrice(Double.parseDouble(row[5].trim()));
                    }
                    if (row.length > 6 && !row[6].isEmpty()) {
                        product.setLowSeasonPrice(Double.parseDouble(row[6].trim()));
                    }
                    if (row.length > 7 && !row[7].isEmpty()) {
                        product.setMidSeasonPrice(Double.parseDouble(row[7].trim()));
                    }
                    if (row.length > 8 && !row[8].isEmpty()) {
                        product.setHighSeasonPrice(Double.parseDouble(row[8].trim()));
                    }
                    if (row.length > 9 && !row[9].isEmpty()) {
                        product.setCurrentSeason(row[9].trim());
                    }

                    if (existingId != null) {
                        productService.updateProduct(existingId, product);
                        updated++;
                    } else {
                        productService.createProduct(product);
                        imported++;
                    }
                } catch (Exception e) {
                    errors.add("Row " + (i + 1) + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", "Failed to parse CSV: " + e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }

        result.put("status", "success");
        result.put("imported", imported);
        result.put("updated", updated);
        result.put("errors", errors);
        log.info("Imported {} new products, updated {} existing", imported, updated);
        return ResponseEntity.ok(result);
    }

    // ==========================================
    // UNIT CSV OPERATIONS
    // ==========================================

    /**
     * Export all units to CSV
     */
    @GetMapping("/units/export")
    public void exportUnits(HttpServletResponse response) throws Exception {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"units.csv\"");

        List<Unit> units = unitService.getAllUnits();

        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(response.getOutputStream()))) {
            // Header
            String[] header = { "id", "name", "productId", "productName", "inventoryCount", "currentPrice" };
            writer.writeNext(header);

            // Data rows
            for (Unit u : units) {
                String[] row = {
                        String.valueOf(u.getId()),
                        u.getName(),
                        u.getProduct() != null ? String.valueOf(u.getProduct().getId()) : "",
                        u.getProduct() != null ? u.getProduct().getName() : "",
                        String.valueOf(u.getInventoryCount()),
                        String.valueOf(u.getCurrentPrice())
                };
                writer.writeNext(row);
            }
        }
        log.info("Exported {} units to CSV", units.size());
    }

    /**
     * Import units from CSV
     */
    @PostMapping("/units/import")
    public ResponseEntity<Map<String, Object>> importUnits(@RequestParam("file") MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        List<String> errors = new ArrayList<>();
        int imported = 0;
        int updated = 0;

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> rows = reader.readAll();

            if (rows.isEmpty()) {
                result.put("status", "error");
                result.put("message", "CSV file is empty");
                return ResponseEntity.badRequest().body(result);
            }

            // Skip header row
            for (int i = 1; i < rows.size(); i++) {
                String[] row = rows.get(i);
                try {
                    Unit unit = new Unit();

                    // Check if updating existing unit
                    Long existingId = null;
                    if (row.length > 0 && !row[0].isEmpty()) {
                        try {
                            existingId = Long.parseLong(row[0].trim());
                        } catch (NumberFormatException ignored) {
                        }
                    }

                    if (row.length > 1)
                        unit.setName(row[1].trim());

                    // Product ID (column 2)
                    if (row.length > 2 && !row[2].isEmpty()) {
                        try {
                            Long productId = Long.parseLong(row[2].trim());
                            Product product = productService.getProductById(productId);
                            unit.setProduct(product);
                        } catch (Exception e) {
                            errors.add("Row " + (i + 1) + ": Invalid product ID");
                        }
                    }

                    // Skip productName (column 3) - it's just for readability

                    if (row.length > 4 && !row[4].isEmpty()) {
                        unit.setInventoryCount(Integer.parseInt(row[4].trim()));
                    }
                    if (row.length > 5 && !row[5].isEmpty()) {
                        unit.setCurrentPrice(Double.parseDouble(row[5].trim()));
                    }

                    if (existingId != null) {
                        unitService.updateUnit(existingId, unit);
                        updated++;
                    } else {
                        unitService.createUnit(unit);
                        imported++;
                    }
                } catch (Exception e) {
                    errors.add("Row " + (i + 1) + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", "Failed to parse CSV: " + e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }

        result.put("status", "success");
        result.put("imported", imported);
        result.put("updated", updated);
        result.put("errors", errors);
        log.info("Imported {} new units, updated {} existing", imported, updated);
        return ResponseEntity.ok(result);
    }
}
