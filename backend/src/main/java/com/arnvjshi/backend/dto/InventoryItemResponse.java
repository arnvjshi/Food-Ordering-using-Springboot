package com.arnvjshi.backend.dto;

import java.time.Instant;

import com.arnvjshi.backend.entity.InventoryItem;

public record InventoryItemResponse(
        Long id,
        String sku,
        String name,
        String category,
        String location,
        String supplier,
        int quantity,
        int reorderLevel,
        String status,
        boolean lowStock,
        String notes,
        Instant updatedAt) {

    public static InventoryItemResponse from(InventoryItem item) {
        String status = item.getQuantity() == 0 ? "OUT_OF_STOCK"
                : item.getQuantity() <= item.getReorderLevel() ? "LOW_STOCK" : "IN_STOCK";
        return new InventoryItemResponse(
                item.getId(),
                item.getSku(),
                item.getName(),
                item.getCategory(),
                item.getLocation(),
                item.getSupplier(),
                item.getQuantity(),
                item.getReorderLevel(),
                status,
                item.getQuantity() > 0 && item.getQuantity() <= item.getReorderLevel(),
                item.getNotes(),
                item.getUpdatedAt());
    }
}