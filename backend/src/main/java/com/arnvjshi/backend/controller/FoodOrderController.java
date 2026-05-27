package com.arnvjshi.backend.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.arnvjshi.backend.dto.FoodOrderRequest;
import com.arnvjshi.backend.dto.FoodOrderResponse;
import com.arnvjshi.backend.service.FoodOrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class FoodOrderController {

    private final FoodOrderService foodOrderService;

    public FoodOrderController(FoodOrderService foodOrderService) {
        this.foodOrderService = foodOrderService;
    }

    @GetMapping
    public List<FoodOrderResponse> listOrders(Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        return foodOrderService.listOrders(authentication.getName(), isAdmin);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public FoodOrderResponse createOrder(@Valid @RequestBody FoodOrderRequest request,
                                         Authentication authentication) {
        return foodOrderService.createOrder(request, authentication.getName());
    }
}