package com.arnvjshi.backend.dto;

import java.math.BigDecimal;

import com.arnvjshi.backend.entity.MenuItem;

public record MenuItemResponse(
        Long id,
        Long restaurantId,
        String restaurantName,
        String name,
        String description,
        BigDecimal price,
        String category,
        boolean available,
        int prepMinutes) {

    public static MenuItemResponse from(MenuItem item) {
        return new MenuItemResponse(
                item.getId(),
                item.getRestaurant().getId(),
                item.getRestaurant().getName(),
                item.getName(),
                item.getDescription(),
                item.getPrice(),
                item.getCategory(),
                item.isAvailable(),
                item.getPrepMinutes());
    }
}