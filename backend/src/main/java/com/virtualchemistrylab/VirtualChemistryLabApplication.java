package com.virtualchemistrylab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.virtualchemistrylab.config.AppProperties;

/**
 * Entry point for Virtual Chemistry Lab Backend.
 * Runs as a standard Spring Boot application on port 8080.
 */
@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class VirtualChemistryLabApplication {

    public static void main(String[] args) {
        SpringApplication.run(VirtualChemistryLabApplication.class, args);
    }
}
