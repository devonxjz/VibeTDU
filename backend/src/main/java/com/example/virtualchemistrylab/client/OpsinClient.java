package com.example.virtualchemistrylab.client;

import com.virtualchemistrylab.config.AppProperties;
import com.virtualchemistrylab.dto.ChemicalInfoDTO;
import com.virtualchemistrylab.entity.ApiErrorLog;
import com.virtualchemistrylab.repository.ApiErrorLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

/**
 * Calls OPSIN (Open Parser for Systematic IUPAC Nomenclature) REST service.
 * Endpoint: /opsin/{name} => returns JSON with smiles, stdinchi, stdinchikey
 * Used as a last-resort fallback after PubChem and Cactus.
 */
@Component
public class OpsinClient {

    private static final Logger log = LoggerFactory.getLogger(OpsinClient.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(8);

    private final WebClient webClient;
    private final AppProperties appProperties;
    private final ApiErrorLogRepository apiErrorLogRepository;

    public OpsinClient(WebClient webClient,
                       AppProperties appProperties,
                       ApiErrorLogRepository apiErrorLogRepository) {
        this.webClient = webClient;
        this.appProperties = appProperties;
        this.apiErrorLogRepository = apiErrorLogRepository;
    }

    /**
     * Resolve an IUPAC name via OPSIN.
     */
    public ChemicalInfoDTO resolve(String query) {
        String baseUrl = appProperties.getOpsin().getBaseUrl();
        String url = baseUrl + "/" + encode(query) + ".json";

        log.info("[OPSIN] Calling external API for query: {}", query);

        try {
            String raw = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(TIMEOUT)
                    .block();

            if (raw == null || raw.isBlank()) {
                log.warn("[OPSIN] No result for: {}", query);
                return null;
            }

            return parseOpsinResponse(query, raw);

        } catch (Exception e) {
            log.error("[OPSIN] Call failed for {}: {}", query, e.getMessage());
            saveErrorLog("OPSIN", query, e.getMessage());
            return null;
        }
    }

    private ChemicalInfoDTO parseOpsinResponse(String query, String raw) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(raw);

            String smiles = root.path("smiles").asText(null);
            String inchi = root.path("stdinchi").asText(null);
            String inchiKey = root.path("stdinchikey").asText(null);

            if (smiles == null && inchi == null) return null;

            return ChemicalInfoDTO.builder()
                    .input(query)
                    .canonicalFormula(query.trim())
                    .canonicalName(query.trim())
                    .smiles(smiles)
                    .inchi(inchi)
                    .inchiKey(inchiKey)
                    .source("OPSIN")
                    .build();
        } catch (Exception e) {
            log.warn("[OPSIN] Parse error: {}", e.getMessage());
            return null;
        }
    }

    private String encode(String s) {
        try {
            return java.net.URLEncoder.encode(s, "UTF-8");
        } catch (Exception ex) {
            return s;
        }
    }

    private void saveErrorLog(String api, String request, String error) {
        try {
            apiErrorLogRepository.save(ApiErrorLog.builder()
                    .apiName(api)
                    .requestPayload(request)
                    .errorMessage(error)
                    .build());
        } catch (Exception ignored) {}
    }
}
