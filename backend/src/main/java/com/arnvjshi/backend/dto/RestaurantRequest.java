package com.arnvjshi.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RestaurantRequest(
        @NotBlank @Size(min = 2, max = 120) String name,
        @NotBlank @Size(min = 2, max = 80) String cuisine,
        @NotBlank @Size(min = 3, max = 160) String location,
        @Min(0) double rating,
        boolean active) {
}