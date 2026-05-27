package com.arnvjshi.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record FoodOrderItemRequest(
        @NotNull Long menuItemId,
        @Min(1) int quantity) {
}