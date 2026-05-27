package com.arnvjshi.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arnvjshi.backend.entity.InventoryItem;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findAllByOrderByNameAsc();

    boolean existsBySku(String sku);
}