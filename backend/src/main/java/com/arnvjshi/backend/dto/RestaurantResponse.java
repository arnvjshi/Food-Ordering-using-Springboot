package com.arnvjshi.backend.dto;

import com.arnvjshi.backend.entity.Restaurant;

public record RestaurantResponse(
        Long id,
        String name,
        String cuisine,
        String location,
        double rating,
        boolean active) {

    public static RestaurantResponse from(Restaurant restaurant) {
        return new RestaurantResponse(
                restaurant.getId(),
                restaurant.getName(),
                restaurant.getCuisine(),
                restaurant.getLocation(),
                restaurant.getRating(),
                restaurant.isActive());
    }
}