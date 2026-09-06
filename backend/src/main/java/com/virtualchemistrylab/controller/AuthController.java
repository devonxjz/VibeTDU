package com.virtualchemistrylab.controller;

import com.virtualchemistrylab.config.AuthUser;
import com.virtualchemistrylab.dto.auth.AuthRequests.GoogleLoginRequest;
import com.virtualchemistrylab.dto.auth.AuthRequests.LoginRequest;
import com.virtualchemistrylab.dto.auth.AuthRequests.RegisterRequest;
import com.virtualchemistrylab.dto.auth.AuthResponse;
import com.virtualchemistrylab.entity.User;
import com.virtualchemistrylab.service.auth.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserProfile> me(HttpServletRequest request) {
        User user = AuthUser.require(request);
        return ResponseEntity.ok(authService.profile(user));
    }
}
