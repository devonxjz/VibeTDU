package com.virtualchemistrylab.service;

import com.virtualchemistrylab.dto.*;
import com.virtualchemistrylab.entity.ExperimentSession;
import com.virtualchemistrylab.repository.ExperimentSessionRepository;
import com.virtualchemistrylab.util.ReactionKeyUtil;
import com.virtualchemistrylab.util.ReactionProductParser;
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
    private final SequentialReactionService sequentialReactionService;
    private final ExperimentLogService experimentLogService;
    private final ExperimentSessionRepository sessionRepository;

    public LabMixService(RateLimitService rateLimitService,
                         ChemicalResolverService chemicalResolverService,
                         SequentialReactionService sequentialReactionService,
                         ExperimentLogService experimentLogService,
                         ExperimentSessionRepository sessionRepository) {
        this.rateLimitService = rateLimitService;
        this.chemicalResolverService = chemicalResolverService;
        this.sequentialReactionService = sequentialReactionService;
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

        // D. Delegate to sequential reaction orchestrator
        MixResponse response = sequentialReactionService.process(
                allFormulae, 
                request.getTemperature(), 
                request.getPressure(), 
                request.getCatalyst()
        );

        // Map session to vessel (frontend needs this inside newTargetVesselState)
        if (response.getFinalContents() != null && !response.getFinalContents().isEmpty()) {
            MixResponse.NewVesselState vesselState = new MixResponse.NewVesselState();
            vesselState.setVesselId(request.getTargetVesselId());
            vesselState.setContents(response.getFinalContents().stream()
                .map(fc -> MixResponse.ProductEntry.builder().formula(fc.getFormula()).state(fc.getState()).build())
                .toList());
            
            // Extract display color from last step if available, else default
            if (response.getSteps() != null && !response.getSteps().isEmpty()) {
                ReactionStepDTO lastStep = response.getSteps().get(response.getSteps().size() - 1);
                vesselState.setDisplayColor(getDisplayColorFromStep(lastStep));
                
                // Add released gas if any from the steps
                response.getSteps().stream()
                    .filter(s -> s.getEffectType() != null && s.getEffectType().equals("GAS_BUBBLE"))
                    .reduce((first, second) -> second) // findLast equivalent
                    .ifPresent(s -> {
                        // find gas formula from products
                        List<String> prods = ReactionProductParser.parse(s.getProductFormula());
                        for (String p : prods) {
                            if (p.endsWith("(g)") || p.equalsIgnoreCase("CO2") || p.equalsIgnoreCase("H2")) {
                                vesselState.setReleasedGas(MixResponse.GasEntry.builder().formula(p).build());
                                break;
                            }
                        }
                    });
            } else {
                vesselState.setDisplayColor("#CCCCCC");
            }
            response.setNewTargetVesselState(vesselState);
        } else {
            // No contents
            MixResponse.NewVesselState emptyState = new MixResponse.NewVesselState();
            emptyState.setVesselId(request.getTargetVesselId());
            emptyState.setDisplayColor("#CCCCCC");
            response.setNewTargetVesselState(emptyState);
        }

        // Backward compatibility: Set legacy result field
        if (response.getSteps() != null && !response.getSteps().isEmpty()) {
            ReactionStepDTO firstStep = response.getSteps().get(0);
            response.setResult(com.virtualchemistrylab.dto.ReactionResultDTO.builder()
                    .hasReaction(firstStep.isHasReaction())
                    .equation(firstStep.getEquation())
                    .productFormula(firstStep.getProductFormula())
                    .effectType(firstStep.getEffectType())
                    .messageVi(firstStep.getMessageVi())
                    .build());
        } else {
            response.setResult(com.virtualchemistrylab.dto.ReactionResultDTO.builder()
                    .hasReaction(false)
                    .messageVi("Không có phản ứng.")
                    .build());
        }

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

    private String getDisplayColorFromStep(ReactionStepDTO step) {
        // Fallback or explicit colors could be added here
        if ("PRECIPITATE".equals(step.getEffectType())) {
            return "#DDDDDD";
        }
        return "#CCCCCC";
    }
}
