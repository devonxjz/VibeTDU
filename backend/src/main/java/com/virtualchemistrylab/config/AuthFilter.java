package com.virtualchemistrylab.config;

import com.virtualchemistrylab.entity.User;
import com.virtualchemistrylab.repository.UserRepository;
import com.virtualchemistrylab.service.auth.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        Optional<User> user = resolveUser(request);
        user.ifPresent(value -> request.setAttribute(AuthUser.REQUEST_ATTRIBUTE, value));

        if (isProtectedPath(request) && user.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"status\":\"error\",\"message\":\"Vui lòng đăng nhập\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Optional<User> resolveUser(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return Optional.empty();
        }

        try {
            UUID userId = jwtService.parseUserId(header.substring("Bearer ".length()).trim());
            return userRepository.findById(userId);
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    private boolean isProtectedPath(HttpServletRequest request) {
        String path = request.getRequestURI();
        return "/api/auth/me".equals(path) || path.startsWith("/api/journal");
    }
}
