// Product.java
package com.smart_freshness_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name; // e.g. "Banana"

    private String category; // e.g. "Fruits", "Vegetables", "Dairy"

    @Column(length = 500)
    private String description;

    private String imageUrl;

    @Positive
    @Column(nullable = false)
    private Double basePrice; // default/base price

    // Seasonal pricing
    private Double lowSeasonPrice;
    private Double midSeasonPrice;
    private Double highSeasonPrice;

    @Column(nullable = false)
    @Builder.Default
    private String currentSeason = "mid"; // "low", "mid", "high"

    /**
     * Get the effective base price based on current season
     */
    public Double getEffectiveBasePrice() {
        return switch (currentSeason) {
            case "low" -> lowSeasonPrice != null ? lowSeasonPrice : basePrice;
            case "high" -> highSeasonPrice != null ? highSeasonPrice : basePrice;
            default -> midSeasonPrice != null ? midSeasonPrice : basePrice;
        };
    }
}
