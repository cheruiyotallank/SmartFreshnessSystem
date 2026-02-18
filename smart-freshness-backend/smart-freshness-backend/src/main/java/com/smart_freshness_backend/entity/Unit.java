// Unit.java
package com.smart_freshness_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Unit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private String name; // e.g. "Banana Crate A"
    private String location; // Optional: e.g. "Storage Room 1"
    private Integer inventoryCount; // number of items in this unit
    private Double currentPrice; // latest price
}
