package com.example.virtualchemistrylab.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Provides pre-configured WebClient beans for external HTTP calls.
 * A generic bean is provided; specific clients inject it and set base URLs.
 */
@Configuration
public class WebClientConfig {

    /**
     * General-purpose WebClient with JSON content-type preset.
     */
    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .codecs(configurer ->
                        configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024)) // 2 MB buffer
                .build();
    }
}
