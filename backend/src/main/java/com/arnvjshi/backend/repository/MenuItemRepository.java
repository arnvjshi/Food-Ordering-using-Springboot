package com.arnvjshi.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arnvjshi.backend.entity.MenuItem;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findAllByRestaurantIdOrderByNameAsc(Long restaurantId);

    List<MenuItem> findAllByRestaurantIdAndAvailableTrueOrderByNameAsc(Long restaurantId);
}