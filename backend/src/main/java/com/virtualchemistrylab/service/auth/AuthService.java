package com.virtualchemistrylab.service.auth;

import com.virtualchemistrylab.dto.auth.AuthRequests.GoogleLoginRequest;
import com.virtualchemistrylab.dto.auth.AuthRequests.LoginRequest;
import com.virtualchemistrylab.dto.auth.AuthRequests.RegisterRequest;
import com.virtualchemistrylab.dto.auth.AuthResponse;
import com.virtualchemistrylab.entity.User;
import com.virtualchemistrylab.exception.ApiException;
import com.virtualchemistrylab.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException("Email đã được sử dụng", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .email(email)
                .provider("local")
                .name(request.name().trim())
                .passwordHash(passwordEncoder.encode(request.password()))
                .aiQuotaRemaining(20)
                .lastResetDate(LocalDate.now())
                .build();

        return responseFor(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(() -> invalidCredentials());

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }

        return responseFor(user);
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleTokenVerifier.GoogleProfile profile = googleTokenVerifier.verify(request.credential());
        String email = normalizeEmail(profile.email());

        User user = userRepository.findByGoogleSub(profile.subject())
                .or(() -> userRepository.findByEmailIgnoreCase(email))
                .orElseGet(User::new);

        user.setEmail(email);
        user.setProvider("google");
        user.setGoogleSub(profile.subject());
        user.setName(nonBlank(profile.name(), email));
        user.setPictureUrl(profile.pictureUrl());
        if (user.getAiQuotaRemaining() == null) {
            user.setAiQuotaRemaining(20);
        }
        if (user.getLastResetDate() == null) {
            user.setLastResetDate(LocalDate.now());
        }

        return responseFor(userRepository.save(user));
    }

    public AuthResponse.UserProfile profile(User user) {
        return AuthResponse.UserProfile.from(user);
    }

    private AuthResponse responseFor(User user) {
        return new AuthResponse(jwtService.issue(user), AuthResponse.UserProfile.from(user));
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String nonBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private static ApiException invalidCredentials() {
        return new ApiException("Email hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED);
    }
}
