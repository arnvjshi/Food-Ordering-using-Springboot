package com.arnvjshi.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arnvjshi.backend.entity.FoodOrder;

public interface FoodOrderRepository extends JpaRepository<FoodOrder, Long> {

    List<FoodOrder> findAllByOrderByCreatedAtDesc();

    List<FoodOrder> findByCreatedByOrderByCreatedAtDesc(String createdBy);
}