package com.arnvjshi.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record InventoryItemRequest(
        @NotBlank @Size(min = 2, max = 50) String sku,
        @NotBlank @Size(min = 2, max = 120) String name,
        @NotBlank @Size(min = 2, max = 80) String category,
        @Size(max = 120) String location,
        @Size(max = 120) String supplier,
        @Min(0) int quantity,
        @Min(0) int reorderLevel,
        @Size(max = 1000) String notes) {
}