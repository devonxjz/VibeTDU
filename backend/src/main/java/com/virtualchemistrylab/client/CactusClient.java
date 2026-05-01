package com.virtualchemistrylab.client;

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
 * Calls the NCI Cactus Chemical Identifier Resolver.
 * Endpoint: /chemical/structure/{name}/iupac_name (plain-text response)
 * Used as fallback when PubChem request fails.
 */
@Component
public class CactusClient {

    private static final Logger log = LoggerFactory.getLogger(CactusClient.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(8);

    private final WebClient webClient;
    private final AppProperties appProperties;
    private final ApiErrorLogRepository apiErrorLogRepository;

    public CactusClient(WebClient webClient,
            AppProperties appProperties,
            ApiErrorLogRepository apiErrorLogRepository) {
        this.webClient = webClient;
        this.appProperties = appProperties;
        this.apiErrorLogRepository = apiErrorLogRepository;
    }

    /**
     * Resolve chemical name via Cactus.
     * Only fetches IUPAC name and formula (Cactus plain-text API).
     */
    public ChemicalInfoDTO resolve(String query) {
        String baseUrl = appProperties.getCactus().getBaseUrl();
        String nameUrl = baseUrl + "/" + encode(query) + "/iupac_name";

        log.info("[Cactus] Calling external API for query: {}", query);

        try {
            String iupacName = webClient.get()
                    .uri(nameUrl)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(TIMEOUT)
                    .block();

            if (iupacName == null || iupacName.isBlank() || iupacName.startsWith("Page not found")) {
                log.warn("[Cactus] No result for: {}", query);
                return null;
            }

            return ChemicalInfoDTO.builder()
                    .input(query)
                    .canonicalFormula(query.trim())
                    .canonicalName(iupacName.trim())
                    .source("CACTUS")
                    .build();

        } catch (Exception e) {
            log.error("[Cactus] Call failed for {}: {}", query, e.getMessage());
            saveErrorLog("CACTUS", query, e.getMessage());
            return null;
        }
    }

    private String encode(String s) {
        try {
            return java.net.URLEncoder.encode(s, "UTF-8");
        } catch (Exception e) {
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
        } catch (Exception ignored) {
        }
    }
}
