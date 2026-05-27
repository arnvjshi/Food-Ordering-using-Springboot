package com.arnvjshi.backend.dto;

public record AuthResponse(String token, UserResponse user) {
}