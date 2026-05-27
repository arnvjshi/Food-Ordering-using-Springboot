package com.arnvjshi.backend.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FoodOrderRequest(
        @NotNull Long restaurantId,
        @NotBlank @Size(min = 2, max = 120) String customerName,
        @NotBlank @Size(min = 5, max = 30) String customerPhone,
        @NotBlank @Size(min = 5, max = 200) String deliveryAddress,
        @NotEmpty List<@Valid FoodOrderItemRequest> items) {
}