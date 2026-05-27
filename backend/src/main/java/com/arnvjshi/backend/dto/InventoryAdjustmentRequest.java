package com.arnvjshi.backend.dto;

import jakarta.validation.constraints.NotNull;

public record InventoryAdjustmentRequest(
        @NotNull Integer delta,
        String reason) {
}