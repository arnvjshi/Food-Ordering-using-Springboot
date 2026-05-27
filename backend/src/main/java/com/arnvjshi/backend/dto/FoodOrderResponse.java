package com.arnvjshi.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.arnvjshi.backend.entity.FoodOrder;

public record FoodOrderResponse(
        Long id,
        Long restaurantId,
        String restaurantName,
        String status,
        String customerName,
        String customerPhone,
        String deliveryAddress,
        Instant createdAt,
        BigDecimal totalAmount,
        String createdBy,
        List<FoodOrderItemResponse> items) {

    public static FoodOrderResponse from(FoodOrder order, List<FoodOrderItemResponse> items) {
        return new FoodOrderResponse(
                order.getId(),
                order.getRestaurant().getId(),
                order.getRestaurant().getName(),
                order.getStatus(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getDeliveryAddress(),
                order.getCreatedAt(),
                order.getTotalAmount(),
                order.getCreatedBy(),
                items);
    }
}