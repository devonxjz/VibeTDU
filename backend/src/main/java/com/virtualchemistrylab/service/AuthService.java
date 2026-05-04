package com.virtualchemistrylab.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.virtualchemistrylab.entity.User;
import com.virtualchemistrylab.exception.ApiException;
import com.virtualchemistrylab.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Orchestrates the Google OAuth login flow:
 *  1. Verifies the Google ID token.
 *  2. Upserts the User record in the database.
 *  3. Issues an internal JWT.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final GoogleTokenVerifier googleTokenVerifier;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    public record LoginResult(String jwt, User user) {}

    /**
     * Authenticates a user via a Google ID Token.
     * Creates the user if this is their first login, otherwise returns the existing user.
     *
     * @throws ApiException with 401 if the token is invalid or expired.
     */
    @Transactional
    public LoginResult loginWithGoogle(String idTokenString) {
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(idTokenString);
        if (payload == null) {
            throw new ApiException("The provided Google ID token is invalid or expired.",
                    org.springframework.http.HttpStatus.UNAUTHORIZED);
        }

        String googleSub = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String pictureUrl = (String) payload.get("picture");

        User user = userRepository.findByGoogleSub(googleSub)
                .or(() -> userRepository.findByEmail(email))
                .map(existing -> updateUserProfile(existing, googleSub, name, pictureUrl))
                .orElseGet(() -> createNewUser(googleSub, email, name, pictureUrl));

        String jwt = jwtProvider.issue(user.getId(), user.getEmail());
        log.info("[auth] login success – userId={} email={}", user.getId(), email);
        return new LoginResult(jwt, user);
    }

    private User updateUserProfile(User user, String googleSub, String name, String pictureUrl) {
        // Sync latest Google profile info on every login, but preserve quota.
        user.setGoogleSub(googleSub);
        user.setName(name);
        user.setPictureUrl(pictureUrl);
        return userRepository.save(user);
    }

    private User createNewUser(String googleSub, String email, String name, String pictureUrl) {
        User user = User.builder()
                .googleSub(googleSub)
                .email(email)
                .name(name)
                .pictureUrl(pictureUrl)
                .provider("google")
                .aiQuotaRemaining(20)
                .lastResetDate(LocalDate.now())
                .build();
        return userRepository.save(user);
    }
}
