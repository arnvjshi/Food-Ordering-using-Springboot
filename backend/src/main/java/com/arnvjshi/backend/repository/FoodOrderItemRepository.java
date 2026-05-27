package com.arnvjshi.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arnvjshi.backend.entity.FoodOrderItem;

public interface FoodOrderItemRepository extends JpaRepository<FoodOrderItem, Long> {

    List<FoodOrderItem> findAllByOrderId(Long orderId);
}