package com.smart_freshness_backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.smart_freshness_backend.entity.SensorReading;
import com.smart_freshness_backend.entity.Unit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service for generating PDF reports
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final UnitService unitService;
    private final ProductService productService;
    private final AnalyticsService analyticsService;

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 18, Font.BOLD, Color.DARK_GRAY);
    private static final Font SUBTITLE_FONT = new Font(Font.HELVETICA, 12, Font.ITALIC, Color.GRAY);
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 11, Font.BOLD, Color.WHITE);
    private static final Font CELL_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.BLACK);
    private static final Color HEADER_BG = new Color(34, 139, 34); // Forest Green

    /**
     * Generate inventory report PDF
     */
    public byte[] generateInventoryReport() throws DocumentException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 54, 54);
        PdfWriter.getInstance(document, out);

        document.open();

        // Title
        Paragraph title = new Paragraph("Inventory Report", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        // Subtitle with date
        Paragraph subtitle = new Paragraph(
                "Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                SUBTITLE_FONT);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        document.add(subtitle);
        document.add(Chunk.NEWLINE);

        // Summary Section
        document.add(createSummarySection());
        document.add(Chunk.NEWLINE);

        // Units Table
        document.add(new Paragraph("Unit Inventory Details",
                new Font(Font.HELVETICA, 14, Font.BOLD, Color.DARK_GRAY)));
        document.add(Chunk.NEWLINE);
        document.add(createUnitsTable());

        document.close();
        log.info("Generated inventory report PDF");
        return out.toByteArray();
    }

    /**
     * Generate freshness report PDF for a specific unit
     */
    public byte[] generateFreshnessReport(Long unitId, List<SensorReading> readings) throws DocumentException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 54, 54);
        PdfWriter.getInstance(document, out);

        document.open();

        Unit unit = unitService.getUnitById(unitId);

        // Title
        Paragraph title = new Paragraph("Freshness Report: " + unit.getName(), TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        // Subtitle
        Paragraph subtitle = new Paragraph(
                "Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                SUBTITLE_FONT);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        document.add(subtitle);
        document.add(Chunk.NEWLINE);

        // Unit info
        document.add(new Paragraph("Product: " + (unit.getProduct() != null ? unit.getProduct().getName() : "N/A")));
        document.add(new Paragraph("Current Price: $" + unit.getCurrentPrice()));
        document.add(new Paragraph("Inventory Count: " + unit.getInventoryCount()));
        document.add(Chunk.NEWLINE);

        // Readings table
        document.add(new Paragraph("Sensor Readings",
                new Font(Font.HELVETICA, 14, Font.BOLD, Color.DARK_GRAY)));
        document.add(Chunk.NEWLINE);
        document.add(createReadingsTable(readings));

        document.close();
        log.info("Generated freshness report for unit {}", unitId);
        return out.toByteArray();
    }

    /**
     * Generate products report PDF
     */
    public byte[] generateProductsReport() throws DocumentException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate(), 36, 36, 54, 54);
        PdfWriter.getInstance(document, out);

        document.open();

        // Title
        Paragraph title = new Paragraph("Products Catalog Report", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        // Subtitle
        Paragraph subtitle = new Paragraph(
                "Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                SUBTITLE_FONT);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        document.add(subtitle);
        document.add(Chunk.NEWLINE);

        // Products table
        document.add(createProductsTable());

        document.close();
        log.info("Generated products catalog report");
        return out.toByteArray();
    }

    // Helper methods

    private PdfPTable createSummarySection() throws DocumentException {
        var summary = analyticsService.getDashboardSummary();

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);

        addSummaryCell(table, "Total Products", String.valueOf(summary.get("totalProducts")));
        addSummaryCell(table, "Total Units", String.valueOf(summary.get("totalUnits")));
        addSummaryCell(table, "Avg Freshness", Math.round((Double) summary.get("avgFreshness")) + "%");
        addSummaryCell(table, "Low Freshness Units", String.valueOf(summary.get("lowFreshnessUnits")));

        return table;
    }

    private void addSummaryCell(PdfPTable table, String label, String value) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOX);
        cell.setPadding(10);
        cell.setBackgroundColor(new Color(240, 255, 240));

        Paragraph p = new Paragraph();
        p.add(new Phrase(value + "\n", new Font(Font.HELVETICA, 16, Font.BOLD, HEADER_BG)));
        p.add(new Phrase(label, SUBTITLE_FONT));
        p.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(p);

        table.addCell(cell);
    }

    private PdfPTable createUnitsTable() throws DocumentException {
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[] { 1, 2, 2, 1.5f, 1.5f });

        // Headers
        addHeaderCell(table, "ID");
        addHeaderCell(table, "Unit Name");
        addHeaderCell(table, "Product");
        addHeaderCell(table, "Inventory");
        addHeaderCell(table, "Current Price");

        // Data
        List<Unit> units = unitService.getAllUnits();
        for (Unit unit : units) {
            addDataCell(table, String.valueOf(unit.getId()));
            addDataCell(table, unit.getName());
            addDataCell(table, unit.getProduct() != null ? unit.getProduct().getName() : "N/A");
            addDataCell(table, String.valueOf(unit.getInventoryCount()));
            addDataCell(table, "$" + String.format("%.2f", unit.getCurrentPrice()));
        }

        return table;
    }

    private PdfPTable createReadingsTable(List<SensorReading> readings) throws DocumentException {
        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);

        // Headers
        addHeaderCell(table, "Timestamp");
        addHeaderCell(table, "Freshness");
        addHeaderCell(table, "Temperature");
        addHeaderCell(table, "Humidity");
        addHeaderCell(table, "VOC");
        addHeaderCell(table, "Price");

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM-dd HH:mm");

        // Data (limit to 50 most recent)
        readings.stream().limit(50).forEach(r -> {
            addDataCell(table, r.getTimestamp().format(fmt));
            addDataCell(table, r.getFreshnessScore() + "%");
            addDataCell(table, String.format("%.1f°C", r.getTemperature()));
            addDataCell(table, String.format("%.1f%%", r.getHumidity()));
            addDataCell(table, String.format("%.1f", r.getVoc()));
            addDataCell(table, "$" + String.format("%.2f", r.getComputedPrice()));
        });

        return table;
    }

    private PdfPTable createProductsTable() throws DocumentException {
        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);

        // Headers
        addHeaderCell(table, "ID");
        addHeaderCell(table, "Name");
        addHeaderCell(table, "Category");
        addHeaderCell(table, "Base Price");
        addHeaderCell(table, "Low Season");
        addHeaderCell(table, "High Season");
        addHeaderCell(table, "Current Season");

        // Data
        var products = productService.getAllProducts();
        for (var product : products) {
            addDataCell(table, String.valueOf(product.getId()));
            addDataCell(table, product.getName());
            addDataCell(table, product.getCategory() != null ? product.getCategory() : "N/A");
            addDataCell(table, "$" + String.format("%.2f", product.getBasePrice()));
            addDataCell(table,
                    product.getLowSeasonPrice() != null ? "$" + String.format("%.2f", product.getLowSeasonPrice())
                            : "-");
            addDataCell(table,
                    product.getHighSeasonPrice() != null ? "$" + String.format("%.2f", product.getHighSeasonPrice())
                            : "-");
            addDataCell(table, product.getCurrentSeason());
        }

        return table;
    }

    private void addHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, HEADER_FONT));
        cell.setBackgroundColor(HEADER_BG);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(8);
        table.addCell(cell);
    }

    private void addDataCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, CELL_FONT));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(6);
        table.addCell(cell);
    }
}
