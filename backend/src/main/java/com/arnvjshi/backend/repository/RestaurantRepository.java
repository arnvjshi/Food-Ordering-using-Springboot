package com.arnvjshi.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arnvjshi.backend.entity.Restaurant;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    List<Restaurant> findAllByOrderByNameAsc();
}