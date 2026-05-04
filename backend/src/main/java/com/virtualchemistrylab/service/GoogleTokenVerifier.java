package com.virtualchemistrylab.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

/**
 * Deep module that wraps Google's ID Token verification.
 * The rest of the system depends on this simple interface,
 * and it can be swapped with a mock during testing.
 */
@Component
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(@Value("${app.auth.google.client-id}") String clientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();
    }

    /**
     * Verifies a Google ID Token string and returns the payload if valid.
     * Returns null if the token is invalid, expired, or does not match audience.
     */
    public GoogleIdToken.Payload verify(String idTokenString) {
        try {
            GoogleIdToken token = verifier.verify(idTokenString);
            return token != null ? token.getPayload() : null;
        } catch (GeneralSecurityException | IOException e) {
            return null;
        }
    }
}
