package com.virtualchemistrylab.service.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.virtualchemistrylab.config.AppProperties;
import com.virtualchemistrylab.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GoogleTokenVerifier {

    private final AppProperties appProperties;

    public GoogleTokenVerifier(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public GoogleProfile verify(String credential) {
        String clientId = appProperties.getAuth().getGoogle().getClientId();
        if (clientId == null || clientId.isBlank()) {
            throw new ApiException("Google login chưa được cấu hình", HttpStatus.BAD_REQUEST);
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(List.of(clientId))
                    .build();
            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken == null) {
                throw new ApiException("Google credential không hợp lệ", HttpStatus.BAD_REQUEST);
            }
            GoogleIdToken.Payload payload = idToken.getPayload();
            return new GoogleProfile(
                    payload.getSubject(),
                    payload.getEmail(),
                    stringClaim(payload, "name"),
                    stringClaim(payload, "picture")
            );
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException("Không thể xác thực Google credential", HttpStatus.BAD_REQUEST);
        }
    }

    private static String stringClaim(GoogleIdToken.Payload payload, String key) {
        Object value = payload.get(key);
        return value == null ? null : value.toString();
    }

    public record GoogleProfile(String subject, String email, String name, String pictureUrl) {
    }
}
