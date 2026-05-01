package com.virtualchemistrylab.service;

import com.virtualchemistrylab.dto.*;
import com.virtualchemistrylab.entity.ExperimentSession;
import com.virtualchemistrylab.repository.ExperimentSessionRepository;
import com.virtualchemistrylab.util.ReactionKeyUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

/**
 * Orchestrates the entire /api/lab/mix flow:
 *
 *  A. Validate (done at controller via @Valid, extra checks here)
 *  B. Rate limit
 *  C. Normalise chemicals via ChemicalResolverService
 *  D. Build reactionKey
 *  E–F. Predict reaction (cache or AI)
 *  G. Validate AI response (inside ReactionPredictionService)
 *  H. Save cache (inside ReactionPredictionService)
 *  I. Log experiment
 *  J. Build and return MixResponse
 */
@Service
public class LabMixService {

    private static final Logger log = LoggerFactory.getLogger(LabMixService.class);

    private final RateLimitService rateLimitService;
    private final ChemicalResolverService chemicalResolverService;
    private final ReactionPredictionService reactionPredictionService;
    private final ExperimentLogService experimentLogService;
    private final ExperimentSessionRepository sessionRepository;

    public LabMixService(RateLimitService rateLimitService,
                         ChemicalResolverService chemicalResolverService,
                         ReactionPredictionService reactionPredictionService,
                         ExperimentLogService experimentLogService,
                         ExperimentSessionRepository sessionRepository) {
        this.rateLimitService = rateLimitService;
        this.chemicalResolverService = chemicalResolverService;
        this.reactionPredictionService = reactionPredictionService;
        this.experimentLogService = experimentLogService;
        this.sessionRepository = sessionRepository;
    }

    @Transactional
    public MixResponse mix(MixRequest request) {
        log.info("[lab-mix] Received mix request from session={} source={} target={}",
                request.getSessionCode(), request.getSourceVesselId(), request.getTargetVesselId());

        // B. Rate limit
        rateLimitService.checkAndRecord(request.getSessionCode());

        // Ensure session exists
        ensureSession(request.getSessionCode());

        // C. Resolve chemicals
        List<String> allFormulae = new ArrayList<>();
        for (VesselContentDTO v : request.getSourceContents()) {
            String input = v.getFormula() != null ? v.getFormula() : v.getInputName();
            var resolved = chemicalResolverService.resolve(input);
            allFormulae.add(resolved.info().getCanonicalFormula());
        }
        for (VesselContentDTO v : request.getTargetContents()) {
            String input = v.getFormula() != null ? v.getFormula() : v.getInputName();
            var resolved = chemicalResolverService.resolve(input);
            allFormulae.add(resolved.info().getCanonicalFormula());
        }

        // D. Build reaction key (already done inside ReactionPredictionService, but log here)
        String key = ReactionKeyUtil.buildKey(allFormulae);
        log.info("[lab-mix] Reaction key: {}", key);

        // E–H. Predict (cache-aware)
        var prediction = reactionPredictionService.predict(
            allFormulae, 
            request.getTemperature(), 
            request.getPressure(), 
            request.getCatalyst()
        );
        ReactionResultDTO result = prediction.result();

        // Build vessel state from result
        MixResponse.NewVesselState vesselState = buildVesselState(
                request.getTargetVesselId(), result);

        MixResponse response = MixResponse.builder()
                .status("success")
                .source(prediction.source())
                .cached(prediction.cached())
                .confidence(result.getConfidence())
                .result(result)
                .newTargetVesselState(vesselState)
                .build();

        // I. Log experiment
        experimentLogService.log(request.getSessionCode(), "MIX_CHEMICALS", request, response);
        log.info("[lab-mix] Saved experiment log for session={}", request.getSessionCode());

        return response;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private void ensureSession(String sessionCode) {
        if (!sessionRepository.existsBySessionCode(sessionCode)) {
            ExperimentSession session = ExperimentSession.builder()
                    .sessionCode(sessionCode)
                    .build();
            sessionRepository.save(session);
            log.info("[lab-mix] Created new session: {}", sessionCode);
        } else {
            // Update last active
            sessionRepository.findBySessionCode(sessionCode).ifPresent(s -> {
                s.setLastActiveAt(LocalDateTime.now());
                sessionRepository.save(s);
            });
        }
    }

    /**
     * Build the new vessel state for frontend animation from the reaction result.
     */
    private MixResponse.NewVesselState buildVesselState(String vesselId, ReactionResultDTO result) {
        List<MixResponse.ProductEntry> contents = new ArrayList<>();
        MixResponse.GasEntry gasEntry = null;

        if (Boolean.TRUE.equals(result.getHasReaction()) && result.getProductFormula() != null) {
            // Parse product formula string, e.g. "CaCl2 + CO2 + H2O"
            String[] products = result.getProductFormula().split("\\+");
            for (String p : products) {
                String formula = p.trim();
                // Skip gas products from the contents list – they go to releasedGas
                if (formula.equals(result.getGasFormula())) continue;

                String state = inferState(formula, result);
                contents.add(MixResponse.ProductEntry.builder()
                        .formula(formula)
                        .state(state)
                        .build());
            }

            if (result.getGasFormula() != null && !result.getGasFormula().isBlank()) {
                gasEntry = MixResponse.GasEntry.builder()
                        .formula(result.getGasFormula())
                        .build();
            }
        }

        String displayColor = result.getEffectColor();
        if (displayColor == null) {
            if ("PRECIPITATE".equals(result.getEffectType()) && result.getPrecipitateColor() != null) {
                displayColor = result.getPrecipitateColor();
            } else {
                displayColor = "#CCCCCC"; // neutral
            }
        }

        return MixResponse.NewVesselState.builder()
                .vesselId(vesselId)
                .displayColor(displayColor)
                .contents(contents.isEmpty() ? null : contents)
                .releasedGas(gasEntry)
                .build();
    }

    private String inferState(String formula, ReactionResultDTO result) {
        if (formula.equals(result.getPrecipitateFormula())) return "SOLID";
        if ("GAS_BUBBLE".equals(result.getEffectType()) && formula.equals(result.getGasFormula())) return "GAS";
        if (formula.equalsIgnoreCase("H2O")) return "LIQUID";
        return "AQUEOUS";
    }
}
