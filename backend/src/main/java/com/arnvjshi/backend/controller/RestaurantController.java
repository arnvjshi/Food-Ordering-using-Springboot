package com.arnvjshi.backend.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.arnvjshi.backend.dto.MenuItemRequest;
import com.arnvjshi.backend.dto.MenuItemResponse;
import com.arnvjshi.backend.dto.RestaurantRequest;
import com.arnvjshi.backend.dto.RestaurantResponse;
import com.arnvjshi.backend.service.RestaurantService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @GetMapping
    public List<RestaurantResponse> listRestaurants() {
        return restaurantService.listRestaurants();
    }

    @GetMapping("/{restaurantId}/menu")
    public List<MenuItemResponse> listMenu(@PathVariable Long restaurantId,
                                           @RequestParam(defaultValue = "true") boolean availableOnly) {
        return restaurantService.listMenu(restaurantId, availableOnly);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public RestaurantResponse createRestaurant(@Valid @RequestBody RestaurantRequest request) {
        return restaurantService.createRestaurant(request);
    }

    @PutMapping("/{restaurantId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public RestaurantResponse updateRestaurant(@PathVariable Long restaurantId,
                                               @Valid @RequestBody RestaurantRequest request) {
        return restaurantService.updateRestaurant(restaurantId, request);
    }

    @PostMapping("/{restaurantId}/menu")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public MenuItemResponse addMenuItem(@PathVariable Long restaurantId,
                                        @Valid @RequestBody MenuItemRequest request) {
        return restaurantService.addMenuItem(restaurantId, request);
    }

    @PutMapping("/menu/{menuItemId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public MenuItemResponse updateMenuItem(@PathVariable Long menuItemId,
                                           @Valid @RequestBody MenuItemRequest request) {
        return restaurantService.updateMenuItem(menuItemId, request);
    }
}