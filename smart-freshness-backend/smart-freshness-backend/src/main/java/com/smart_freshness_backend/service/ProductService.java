package com.smart_freshness_backend.service;

import com.smart_freshness_backend.entity.Product;
import com.smart_freshness_backend.exception.ResourceNotFoundException;
import com.smart_freshness_backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final AuditService auditService;

    /**
     * Get all products.
     */
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * Get product by ID.
     */
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    /**
     * Create a new product.
     */
    @Transactional
    public Product createProduct(Product product) {
        // Set default season if not specified
        if (product.getCurrentSeason() == null) {
            product.setCurrentSeason("mid");
        }
        Product saved = productRepository.save(product);

        // Audit log
        auditService.logCreate(
                AuditService.ENTITY_PRODUCT,
                saved.getId(),
                saved,
                "Created product: " + saved.getName());

        return saved;
    }

    /**
     * Update product details.
     */
    @Transactional
    public Product updateProduct(Long id, Product updatedProduct) {
        Product oldProduct = getProductById(id);

        // Clone old values for audit
        String oldName = oldProduct.getName();
        Double oldBasePrice = oldProduct.getBasePrice();

        if (updatedProduct.getName() != null) {
            oldProduct.setName(updatedProduct.getName());
        }
        if (updatedProduct.getCategory() != null) {
            oldProduct.setCategory(updatedProduct.getCategory());
        }
        if (updatedProduct.getDescription() != null) {
            oldProduct.setDescription(updatedProduct.getDescription());
        }
        if (updatedProduct.getImageUrl() != null) {
            oldProduct.setImageUrl(updatedProduct.getImageUrl());
        }
        if (updatedProduct.getBasePrice() != null) {
            oldProduct.setBasePrice(updatedProduct.getBasePrice());
        }
        if (updatedProduct.getLowSeasonPrice() != null) {
            oldProduct.setLowSeasonPrice(updatedProduct.getLowSeasonPrice());
        }
        if (updatedProduct.getMidSeasonPrice() != null) {
            oldProduct.setMidSeasonPrice(updatedProduct.getMidSeasonPrice());
        }
        if (updatedProduct.getHighSeasonPrice() != null) {
            oldProduct.setHighSeasonPrice(updatedProduct.getHighSeasonPrice());
        }
        if (updatedProduct.getCurrentSeason() != null) {
            oldProduct.setCurrentSeason(updatedProduct.getCurrentSeason());
        }

        Product saved = productRepository.save(oldProduct);

        // Audit log
        auditService.logUpdate(
                AuditService.ENTITY_PRODUCT,
                saved.getId(),
                updatedProduct,
                saved,
                String.format("Updated product: %s (price: %s -> %s)",
                        oldName, oldBasePrice, saved.getBasePrice()));

        return saved;
    }

    /**
     * Update product season.
     */
    @Transactional
    public Product updateSeason(Long id, String season) {
        if (!List.of("low", "mid", "high").contains(season.toLowerCase())) {
            throw new IllegalArgumentException("Season must be 'low', 'mid', or 'high'");
        }
        Product product = getProductById(id);
        String oldSeason = product.getCurrentSeason();
        product.setCurrentSeason(season.toLowerCase());
        Product saved = productRepository.save(product);

        // Audit log
        auditService.logUpdate(
                AuditService.ENTITY_PRODUCT,
                saved.getId(),
                null,
                saved,
                String.format("Season changed for %s: %s -> %s", saved.getName(), oldSeason, season));

        return saved;
    }

    /**
     * Delete product by ID.
     */
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Audit log before deletion
        auditService.logDelete(
                AuditService.ENTITY_PRODUCT,
                id,
                product,
                "Deleted product: " + product.getName());

        productRepository.deleteById(id);
    }

    /**
     * Count total products.
     */
    public long countProducts() {
        return productRepository.count();
    }
}
