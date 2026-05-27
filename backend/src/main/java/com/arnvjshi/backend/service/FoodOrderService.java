package com.arnvjshi.backend.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.arnvjshi.backend.dto.FoodOrderItemRequest;
import com.arnvjshi.backend.dto.FoodOrderItemResponse;
import com.arnvjshi.backend.dto.FoodOrderRequest;
import com.arnvjshi.backend.dto.FoodOrderResponse;
import com.arnvjshi.backend.entity.FoodOrder;
import com.arnvjshi.backend.entity.FoodOrderItem;
import com.arnvjshi.backend.entity.MenuItem;
import com.arnvjshi.backend.entity.Restaurant;
import com.arnvjshi.backend.repository.FoodOrderItemRepository;
import com.arnvjshi.backend.repository.FoodOrderRepository;
import com.arnvjshi.backend.repository.MenuItemRepository;
import com.arnvjshi.backend.repository.RestaurantRepository;

@Service
public class FoodOrderService {

    private final FoodOrderRepository foodOrderRepository;
    private final FoodOrderItemRepository foodOrderItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    public FoodOrderService(FoodOrderRepository foodOrderRepository,
                            FoodOrderItemRepository foodOrderItemRepository,
                            RestaurantRepository restaurantRepository,
                            MenuItemRepository menuItemRepository) {
        this.foodOrderRepository = foodOrderRepository;
        this.foodOrderItemRepository = foodOrderItemRepository;
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
    }

    @Transactional(readOnly = true)
    public List<FoodOrderResponse> listOrders(String username, boolean admin) {
        List<FoodOrder> orders = admin
                ? foodOrderRepository.findAllByOrderByCreatedAtDesc()
                : foodOrderRepository.findByCreatedByOrderByCreatedAtDesc(username);

        return orders.stream().map(order -> FoodOrderResponse.from(order, orderItems(order.getId()))).toList();
    }

    @Transactional
    public FoodOrderResponse createOrder(FoodOrderRequest request, String createdBy) {
        Restaurant restaurant = restaurantRepository.findById(request.restaurantId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));

        FoodOrder order = new FoodOrder();
        order.setRestaurant(restaurant);
        order.setStatus("PLACED");
        order.setCustomerName(request.customerName().trim());
        order.setCustomerPhone(request.customerPhone().trim());
        order.setDeliveryAddress(request.deliveryAddress().trim());
        order.setCreatedBy(createdBy);

        BigDecimal total = BigDecimal.ZERO;
        order.setTotalAmount(total);
        FoodOrder savedOrder = foodOrderRepository.save(order);

        for (FoodOrderItemRequest itemRequest : request.items()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.menuItemId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));

            if (!menuItem.isAvailable()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Menu item is unavailable");
            }

            FoodOrderItem orderItem = new FoodOrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.quantity());
            orderItem.setPriceAtOrder(menuItem.getPrice());
            foodOrderItemRepository.save(orderItem);

            total = total.add(menuItem.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity())));
        }

        savedOrder.setTotalAmount(total);
        FoodOrder finalized = foodOrderRepository.save(savedOrder);
        return FoodOrderResponse.from(finalized, orderItems(finalized.getId()));
    }

    private List<FoodOrderItemResponse> orderItems(Long orderId) {
        return foodOrderItemRepository.findAllByOrderId(orderId).stream()
                .map(FoodOrderItemResponse::from)
                .toList();
    }
}