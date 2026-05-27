package com.arnvjshi.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MenuItemRequest(
        @NotBlank @Size(min = 2, max = 120) String name,
        @Size(max = 400) String description,
        @NotNull @Min(0) BigDecimal price,
        @NotBlank @Size(min = 2, max = 60) String category,
        @Min(1) int prepMinutes,
        boolean available) {
}