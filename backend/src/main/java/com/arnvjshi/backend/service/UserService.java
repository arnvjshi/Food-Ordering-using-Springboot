package com.arnvjshi.backend.service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.arnvjshi.backend.dto.CreateUserRequest;
import com.arnvjshi.backend.dto.UserResponse;
import com.arnvjshi.backend.entity.AppUser;
import com.arnvjshi.backend.repository.AppUserRepository;

@Service
public class UserService {

    private static final Set<String> ALLOWED_ROLES = Set.of("ADMIN", "MANAGER", "STAFF");

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        AppUser user = new AppUser();
        user.setUsername(request.username().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName().trim());
        user.setRoles(normalizeRoles(request.roles()));
        return UserResponse.from(userRepository.save(user));
    }

    private Set<String> normalizeRoles(List<String> roles) {
        Set<String> normalized = new LinkedHashSet<>();
        for (String role : roles) {
            String upper = role == null ? "" : role.trim().toUpperCase();
            if (!ALLOWED_ROLES.contains(upper)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported role: " + role);
            }
            normalized.add(upper);
        }

        if (normalized.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one role is required");
        }

        return normalized;
    }
}