package com.tcgtrader.dto;

import com.tcgtrader.entity.User;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(UUID id, UUID roleId, String roleName, String name, String email, Instant createdAt) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getRole().getId(),
                user.getRole().getName(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }
}
