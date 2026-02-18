package com.smart_freshness_backend.repository;

import com.smart_freshness_backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {}
