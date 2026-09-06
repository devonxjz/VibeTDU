package com.virtualchemistrylab.dto.auth;

import com.virtualchemistrylab.entity.User;

import java.util.UUID;

public record AuthResponse(String token, UserProfile user) {

    public record UserProfile(
            UUID id,
            String email,
            String name,
            String pictureUrl,
            String provider,
            Integer aiQuotaRemaining
    ) {
        public static UserProfile from(User user) {
            return new UserProfile(
                    user.getId(),
                    user.getEmail(),
                    user.getName(),
                    user.getPictureUrl(),
                    user.getProvider(),
                    user.getAiQuotaRemaining()
            );
        }
    }
}
