package com.virtualchemistrylab.config;

import com.virtualchemistrylab.entity.User;
import com.virtualchemistrylab.exception.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;

public final class AuthUser {

    public static final String REQUEST_ATTRIBUTE = "vibetdu.auth.user";

    private AuthUser() {
    }

    public static User require(HttpServletRequest request) {
        Object value = request.getAttribute(REQUEST_ATTRIBUTE);
        if (value instanceof User user) {
            return user;
        }
        throw new ApiException("Vui lòng đăng nhập", HttpStatus.UNAUTHORIZED);
    }
}
