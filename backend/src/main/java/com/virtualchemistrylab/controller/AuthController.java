package com.virtualchemistrylab.controller;

import com.virtualchemistrylab.entity.User;
import com.virtualchemistrylab.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Handles authentication operations. Currently supports Google OAuth login only.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    public record GoogleLoginRequest(@NotBlank String idToken) {}

    public record UserProfile(
            String id,
            String email,
            String name,
            String pictureUrl,
            int aiQuotaRemaining
    ) {}

    /**
     * POST /api/auth/google
     * Accepts a Google ID Token from NextAuth and returns an internal JWT.
     */
    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest req) {
        AuthService.LoginResult result = authService.loginWithGoogle(req.idToken());
        User user = result.user();

        return ResponseEntity.ok(Map.of(
                "jwt", result.jwt(),
                "user", new UserProfile(
                        user.getId().toString(),
                        user.getEmail(),
                        user.getName(),
                        user.getPictureUrl(),
                        user.getAiQuotaRemaining()
                )
        ));
    }
}
