package com.dsaviz.dto;

import com.dsaviz.entity.User;

import java.time.Instant;

public record UserResponse(
        Long id,
        String email,
        boolean emailVerified,
        String avatarUrl,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.isEmailVerified(),
                user.getAvatarUrl(),
                user.getCreatedAt()
        );
    }
}
