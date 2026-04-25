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
 * Calls PubChem PUG REST API to resolve chemical names to canonical information.
 * Endpoint pattern: /compound/name/{name}/property/IUPACName,MolecularFormula,IsomericSMILES/JSON
 *
 * Falls back gracefully on any network/parse error.
 */
@Component
public class PubChemClient {

    private static final Logger log = LoggerFactory.getLogger(PubChemClient.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(8);

    private final WebClient webClient;
    private final AppProperties appProperties;
    private final ApiErrorLogRepository apiErrorLogRepository;

    public PubChemClient(WebClient webClient,
                         AppProperties appProperties,
                         ApiErrorLogRepository apiErrorLogRepository) {
        this.webClient = webClient;
        this.appProperties = appProperties;
        this.apiErrorLogRepository = apiErrorLogRepository;
    }

    /**
     * Resolve a chemical query to canonical information.
     * @param query e.g. "NaOH" or "sodium hydroxide"
     * @return ChemicalInfoDTO or null on failure
     */
    public ChemicalInfoDTO resolve(String query) {
        String baseUrl = appProperties.getPubchem().getBaseUrl();
        String url = baseUrl + "/compound/name/" + encode(query)
                + "/property/IUPACName,MolecularFormula,IsomericSMILES,InChI,InChIKey/JSON";

        log.info("[PubChem] Calling external API for query: {}", query);

        try {
            String raw = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(TIMEOUT)
                    .block();

            if (raw == null || !raw.contains("PropertyTable")) {
                log.warn("[PubChem] Empty or unexpected response for: {}", query);
                return null;
            }

            return parsePubChemResponse(query, raw);

        } catch (Exception e) {
            log.error("[PubChem] Call failed for {}: {}", query, e.getMessage());
            saveErrorLog("PUBCHEM", query, e.getMessage());
            return null;
        }
    }

    private ChemicalInfoDTO parsePubChemResponse(String query, String raw) {
        // Quick JSON extraction without full Jackson tree (to keep it light)
        // PubChem returns: {"PropertyTable":{"Properties":[{...}]}}
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(raw);
            com.fasterxml.jackson.databind.JsonNode props = root
                    .path("PropertyTable").path("Properties");

            if (!props.isArray() || props.isEmpty()) return null;

            com.fasterxml.jackson.databind.JsonNode first = props.get(0);
            return ChemicalInfoDTO.builder()
                    .input(query)
                    .canonicalFormula(first.path("MolecularFormula").asText(null))
                    .canonicalName(first.path("IUPACName").asText(null))
                    .smiles(first.path("IsomericSMILES").asText(null))
                    .inchi(first.path("InChI").asText(null))
                    .inchiKey(first.path("InChIKey").asText(null))
                    .source("PUBCHEM")
                    .build();
        } catch (Exception e) {
            log.warn("[PubChem] Parse error: {}", e.getMessage());
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
        } catch (Exception ignored) {}
    }
}
