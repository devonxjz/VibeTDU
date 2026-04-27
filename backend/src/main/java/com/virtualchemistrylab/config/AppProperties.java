package com.virtualchemistrylab.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Strongly-typed configuration bound from application.properties.
 * All app.* keys are mapped here to avoid magic strings.
 */
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {

    private Ai ai = new Ai();
    private Cors cors = new Cors();
    private RateLimit rateLimit = new RateLimit();
    private PubChem pubchem = new PubChem();
    private Cactus cactus = new Cactus();
    private Opsin opsin = new Opsin();
    private Supabase supabase = new Supabase();

    @Getter @Setter
    public static class Ai {
        private List<String> apiKeys = new ArrayList<>();
        private String apiUrl = "https://api.openai.com/v1/chat/completions";
        private String model = "gpt-4o-mini";
        private boolean mockMode = true;

        public String getApiKey() {
            return (apiKeys != null && !apiKeys.isEmpty()) ? apiKeys.get(0) : null;
        }
    }

    @Getter @Setter
    public static class Cors {
        private String allowedOrigins = "http://localhost:5173,http://localhost:3000";
    }

    @Getter @Setter
    public static class RateLimit {
        private long mixCooldownMs = 2000;
    }

    @Getter @Setter
    public static class PubChem {
        private String baseUrl = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
    }

    @Getter @Setter
    public static class Cactus {
        private String baseUrl = "https://cactus.nci.nih.gov/chemical/structure";
    }

    @Getter @Setter
    public static class Opsin {
        private String baseUrl = "https://opsin.ch.cam.ac.uk";
    }

    @Getter @Setter
    public static class Supabase {
        private String url = "";
        private String anonKey = "";
        private String publishableKey = "";
    }
}
