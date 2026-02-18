package com.smart_freshness_backend.controller;

import com.smart_freshness_backend.entity.SensorReading;
import com.smart_freshness_backend.repository.SensorReadingRepository;
import com.smart_freshness_backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final SensorReadingRepository sensorReadingRepository;

    /**
     * Generate inventory report PDF
     */
    @GetMapping("/inventory")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> getInventoryReport() {
        try {
            byte[] pdf = reportService.generateInventoryReport();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=inventory-report.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Generate freshness report for a specific unit
     */
    @GetMapping("/freshness/{unitId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> getFreshnessReport(@PathVariable Long unitId) {
        try {
            List<SensorReading> readings = sensorReadingRepository.findByUnitIdOrderByTimestampDesc(unitId);
            byte[] pdf = reportService.generateFreshnessReport(unitId, readings);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=freshness-report-unit-" + unitId + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Generate products catalog report
     */
    @GetMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> getProductsReport() {
        try {
            byte[] pdf = reportService.generateProductsReport();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=products-catalog.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
