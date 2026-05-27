package com.arnvjshi.backend.dto;

import java.math.BigDecimal;

import com.arnvjshi.backend.entity.FoodOrderItem;

public record FoodOrderItemResponse(
        Long menuItemId,
        String menuItemName,
        int quantity,
        BigDecimal priceAtOrder) {

    public static FoodOrderItemResponse from(FoodOrderItem item) {
        return new FoodOrderItemResponse(
                item.getMenuItem().getId(),
                item.getMenuItem().getName(),
                item.getQuantity(),
                item.getPriceAtOrder());
    }
}