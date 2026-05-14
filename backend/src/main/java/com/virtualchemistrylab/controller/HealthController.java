package com.virtualchemistrylab.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.virtualchemistrylab.dto.ApiResponse;

@RestController
public class HealthController {

    @GetMapping("/")
    public ApiResponse<String> root() {
        return ApiResponse.success("VibeTDU Backend API is running!");
    }
}
