package com.virtualchemistrylab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.virtualchemistrylab.config.AppProperties;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Properties;

/**
 * Entry point for Virtual Chemistry Lab Backend.
 * Runs as a standard Spring Boot application on port 8080.
 */
@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class VirtualChemistryLabApplication {

    public static void main(String[] args) {
        loadEnv();
        SpringApplication.run(VirtualChemistryLabApplication.class, args);
    }

    private static void loadEnv() {
        try {
            // Priority: Root .env > src/main/resources/.env
            String envPath = Files.exists(Paths.get(".env")) ? ".env" : "src/main/resources/.env";
            if (Files.exists(Paths.get(envPath))) {
                Files.lines(Paths.get(envPath))
                    .map(String::trim)
                    .filter(line -> !line.isEmpty() && !line.startsWith("#") && line.contains("="))
                    .forEach(line -> {
                        String[] parts = line.split("=", 2);
                        String key = parts[0].trim();
                        String value = parts[1].trim();
                        // Only set if not already present in environment
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    });
                System.out.println(">>> Loaded environment variables from " + envPath);
            }
        } catch (IOException e) {
            System.err.println("Could not load .env file: " + e.getMessage());
        }
    }
}
