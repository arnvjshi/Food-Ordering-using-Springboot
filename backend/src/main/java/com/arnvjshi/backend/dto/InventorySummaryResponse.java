package com.arnvjshi.backend.dto;

public record InventorySummaryResponse(
        long totalItems,
        long lowStockItems,
        long outOfStockItems,
        long totalUnits) {
}