package com.smart_freshness_backend.service;

import com.smart_freshness_backend.entity.Product;
import com.smart_freshness_backend.entity.Unit;
import com.smart_freshness_backend.exception.ResourceNotFoundException;
import com.smart_freshness_backend.repository.UnitRepository;
import com.smart_freshness_backend.util.PricingUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UnitService {

    private final UnitRepository unitRepository;
    private final ProductService productService;
    private final PricingUtil pricingUtil;
    private final AuditService auditService;

    /**
     * Get all units.
     */
    public List<Unit> getAllUnits() {
        return unitRepository.findAll();
    }

    /**
     * Get unit by ID.
     */
    public Unit getUnitById(Long id) {
        return unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));
    }

    /**
     * Create a new unit.
     */
    @Transactional
    public Unit createUnit(Unit unit) {
        // Validate product exists
        if (unit.getProduct() != null && unit.getProduct().getId() != null) {
            Product product = productService.getProductById(unit.getProduct().getId());
            unit.setProduct(product);
            // Set initial price from product base price
            if (unit.getCurrentPrice() == null) {
                unit.setCurrentPrice(product.getBasePrice());
            }
        }

        if (unit.getInventoryCount() == null) {
            unit.setInventoryCount(0);
        }

        Unit saved = unitRepository.save(unit);

        // Audit log
        auditService.logCreate(
                AuditService.ENTITY_UNIT,
                saved.getId(),
                saved,
                "Created unit: " + saved.getName());

        return saved;
    }

    /**
     * Update unit details.
     */
    @Transactional
    public Unit updateUnit(Long id, Unit updatedUnit) {
        Unit unit = getUnitById(id);
        String oldName = unit.getName();

        if (updatedUnit.getName() != null) {
            unit.setName(updatedUnit.getName());
        }
        if (updatedUnit.getInventoryCount() != null) {
            unit.setInventoryCount(updatedUnit.getInventoryCount());
        }
        if (updatedUnit.getCurrentPrice() != null) {
            unit.setCurrentPrice(updatedUnit.getCurrentPrice());
        }
        if (updatedUnit.getProduct() != null && updatedUnit.getProduct().getId() != null) {
            Product product = productService.getProductById(updatedUnit.getProduct().getId());
            unit.setProduct(product);
        }

        Unit saved = unitRepository.save(unit);

        // Audit log
        auditService.logUpdate(
                AuditService.ENTITY_UNIT,
                saved.getId(),
                updatedUnit,
                saved,
                "Updated unit: " + oldName);

        return saved;
    }

    /**
     * Update unit price based on freshness score.
     */
    @Transactional
    public Unit updatePriceByFreshness(Long unitId, int freshnessScore) {
        Unit unit = getUnitById(unitId);

        if (unit.getProduct() != null && unit.getProduct().getBasePrice() != null) {
            double newPrice = pricingUtil.calculateDynamicPrice(
                    unit.getProduct().getBasePrice(), freshnessScore);
            unit.setCurrentPrice(newPrice);
            return unitRepository.save(unit);
        }

        return unit;
    }

    /**
     * Delete unit by ID.
     */
    @Transactional
    public void deleteUnit(Long id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));

        // Audit log before deletion
        auditService.logDelete(
                AuditService.ENTITY_UNIT,
                id,
                unit,
                "Deleted unit: " + unit.getName());

        unitRepository.deleteById(id);
    }

    /**
     * Update inventory count.
     */
    @Transactional
    public Unit updateInventory(Long id, int count) {
        Unit unit = getUnitById(id);
        unit.setInventoryCount(count);
        return unitRepository.save(unit);
    }

    /**
     * Count total units.
     */
    public long countUnits() {
        return unitRepository.count();
    }
}
