package com.arnvjshi.backend.dto;

import java.util.LinkedHashSet;
import java.util.Set;

import com.arnvjshi.backend.entity.AppUser;

public record UserResponse(
        Long id,
        String username,
        String fullName,
        Set<String> roles,
        boolean enabled) {

    public static UserResponse from(AppUser user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getFullName(), new LinkedHashSet<>(user.getRoles()), user.isEnabled());
    }
}