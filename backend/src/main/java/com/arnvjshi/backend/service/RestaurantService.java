package com.arnvjshi.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.arnvjshi.backend.dto.MenuItemRequest;
import com.arnvjshi.backend.dto.MenuItemResponse;
import com.arnvjshi.backend.dto.RestaurantRequest;
import com.arnvjshi.backend.dto.RestaurantResponse;
import com.arnvjshi.backend.entity.MenuItem;
import com.arnvjshi.backend.entity.Restaurant;
import com.arnvjshi.backend.repository.MenuItemRepository;
import com.arnvjshi.backend.repository.RestaurantRepository;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    public RestaurantService(RestaurantRepository restaurantRepository, MenuItemRepository menuItemRepository) {
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
    }

    public List<RestaurantResponse> listRestaurants() {
        return restaurantRepository.findAllByOrderByNameAsc().stream()
                .map(RestaurantResponse::from)
                .toList();
    }

    public RestaurantResponse createRestaurant(RestaurantRequest request) {
        Restaurant restaurant = new Restaurant();
        apply(request, restaurant);
        return RestaurantResponse.from(restaurantRepository.save(restaurant));
    }

    public RestaurantResponse updateRestaurant(Long id, RestaurantRequest request) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
        apply(request, restaurant);
        return RestaurantResponse.from(restaurantRepository.save(restaurant));
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> listMenu(Long restaurantId, boolean onlyAvailable) {
        List<MenuItem> items = onlyAvailable
                ? menuItemRepository.findAllByRestaurantIdAndAvailableTrueOrderByNameAsc(restaurantId)
                : menuItemRepository.findAllByRestaurantIdOrderByNameAsc(restaurantId);
        return items.stream().map(MenuItemResponse::from).toList();
    }

    public MenuItemResponse addMenuItem(Long restaurantId, MenuItemRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
        MenuItem item = new MenuItem();
        item.setRestaurant(restaurant);
        apply(request, item);
        return MenuItemResponse.from(menuItemRepository.save(item));
    }

    public MenuItemResponse updateMenuItem(Long menuItemId, MenuItemRequest request) {
        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
        apply(request, item);
        return MenuItemResponse.from(menuItemRepository.save(item));
    }

    public MenuItemResponse toggleAvailability(Long menuItemId, boolean available) {
        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
        item.setAvailable(available);
        return MenuItemResponse.from(menuItemRepository.save(item));
    }

    private void apply(RestaurantRequest request, Restaurant restaurant) {
        restaurant.setName(request.name().trim());
        restaurant.setCuisine(request.cuisine().trim());
        restaurant.setLocation(request.location().trim());
        restaurant.setRating(request.rating());
        restaurant.setActive(request.active());
    }

    private void apply(MenuItemRequest request, MenuItem item) {
        item.setName(request.name().trim());
        item.setDescription(request.description() == null ? null : request.description().trim());
        item.setPrice(request.price());
        item.setCategory(request.category().trim());
        item.setPrepMinutes(request.prepMinutes());
        item.setAvailable(request.available());
    }
}