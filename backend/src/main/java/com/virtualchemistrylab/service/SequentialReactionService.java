package com.virtualchemistrylab.service;

import com.virtualchemistrylab.dto.*;
import com.virtualchemistrylab.util.ReactionKeyUtil;
import com.virtualchemistrylab.util.ReactionProductParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Orchestrates multi-chemical reactions sequentially.
 */
@Service
public class SequentialReactionService {

    private static final Logger log = LoggerFactory.getLogger(SequentialReactionService.class);
    private static final int MAX_REACTION_STEPS = 10;

    private final PairReactionResolverService pairResolver;
    private final ReactionConditionService conditionService;

    // Ordered severity for effect types
    private static final Map<String, Integer> EFFECT_SEVERITY = Map.of(
            "EXPLOSION", 6,
            "GAS_BUBBLE", 5,
            "PRECIPITATE", 4,
            "COLOR_CHANGE", 3,
            "HEAT", 2,
            "NONE", 1
    );

    public SequentialReactionService(PairReactionResolverService pairResolver,
                                     ReactionConditionService conditionService) {
        this.pairResolver = pairResolver;
        this.conditionService = conditionService;
    }

    public MixResponse process(List<String> initialContents, Double temp, Double pressure, String catalyst) {
        List<String> currentContents = new ArrayList<>(initialContents);
        List<ReactionStepDTO> steps = new ArrayList<>();
        Set<String> seenStates = new HashSet<>();
        String ambiguityNote = null;

        // Mark initial state
        seenStates.add(buildStateKey(currentContents));

        int stepNumber = 1;
        while (stepNumber <= MAX_REACTION_STEPS) {
            if (currentContents.size() < 2) break;

            // 1. Generate all pairs and predict
            List<Candidate> candidates = new ArrayList<>();
            for (int i = 0; i < currentContents.size() - 1; i++) {
                for (int j = i + 1; j < currentContents.size(); j++) {
                    String a = currentContents.get(i);
                    String b = currentContents.get(j);

                    ReactionResultDTO result = pairResolver.predictPair(a, b, temp, pressure, catalyst);
                    
                    if (Boolean.TRUE.equals(result.getHasReaction())) {
                        AutoAppliedConditionsDTO applied = conditionService.evaluate(result, temp, pressure, catalyst);
                        candidates.add(new Candidate(a, b, i, j, result, applied));
                    }
                }
            }

            if (candidates.isEmpty()) {
                log.info("[seq-engine] No reacting pairs found. Stopping at step {}", stepNumber);
                break;
            }

            // 2. Select winner based on priority rules
            candidates.sort(new CandidateComparator());
            Candidate winner = candidates.get(0);

            if (candidates.size() > 1 && !ambiguityNoteNeeded(ambiguityNote)) {
                ambiguityNote = "Hệ thống đã tự động chọn hướng phản ứng ưu tiên nhất trong hỗn hợp phức tạp.";
            }

            // 3. Apply winner
            List<String> produced = ReactionProductParser.parse(winner.result.getProductFormula());
            
            // Remove exact instances of reactants (one of a, one of b)
            currentContents.remove(winner.a);
            currentContents.remove(winner.b);
            
            // Add products (simple deduplication could be applied here if needed, but we'll just add them)
            for (String p : produced) {
                if (!currentContents.contains(p)) {
                    currentContents.add(p);
                }
            }

            // 4. Guard infinite loops
            String stateKey = buildStateKey(currentContents);
            if (seenStates.contains(stateKey)) {
                log.warn("[seq-engine] Loop detected. Stopping at step {}", stepNumber);
                ambiguityNote = "Phản ứng dừng lại để tránh vòng lặp vô hạn.";
                
                // Record the step but break
                steps.add(buildStepDto(stepNumber, winner, currentContents, produced));
                break;
            }
            seenStates.add(stateKey);

            // 5. Record step
            steps.add(buildStepDto(stepNumber, winner, currentContents, produced));
            stepNumber++;
        }

        if (stepNumber > MAX_REACTION_STEPS) {
            log.warn("[seq-engine] Hit max reaction steps ({})", MAX_REACTION_STEPS);
            ambiguityNote = "Đã đạt giới hạn số bước mô phỏng tối đa.";
        }

        return buildResponse(initialContents, currentContents, steps, ambiguityNote);
    }

    private String buildStateKey(List<String> contents) {
        return contents.stream().sorted().collect(Collectors.joining("__"));
    }

    private boolean ambiguityNoteNeeded(String current) {
        return current != null;
    }

    private ReactionStepDTO buildStepDto(int stepNum, Candidate winner, List<String> resulting, List<String> produced) {
        return ReactionStepDTO.builder()
                .stepNumber(stepNum)
                .reactants(List.of(winner.a, winner.b))
                .reactionKey(ReactionKeyUtil.buildKey(winner.a, winner.b))
                .hasReaction(true)
                .equation(winner.result.getEquation())
                .productFormula(winner.result.getProductFormula())
                .effectType(winner.result.getEffectType())
                .messageVi(winner.result.getMessageVi())
                .explanationVi(winner.result.getExplanationVi())
                .basicExplanation(winner.result.getBasicExplanation())
                .intermediateExplanation(winner.result.getIntermediateExplanation())
                .advancedExplanation(winner.result.getAdvancedExplanation())
                .safetyNoteVi(winner.result.getSafetyNoteVi())
                .appliedConditions(winner.conditions)
                .consumed(List.of(winner.a, winner.b))
                .produced(produced)
                .resultingContents(new ArrayList<>(resulting))
                .build();
    }

    private MixResponse buildResponse(List<String> initial, List<String> current, List<ReactionStepDTO> steps, String ambiguity) {
        List<FinalContentDTO> finalContents = current.stream()
                .map(f -> FinalContentDTO.builder().formula(f).state(inferState(f)).build())
                .collect(Collectors.toList());

        String mode = initial.size() <= 2 ? "DIRECT_PAIR" : "SEQUENTIAL_MULTI";

        // Extract appliedConditions from the first step that has auto-adjustment
        AutoAppliedConditionsDTO appliedConditions = steps.stream()
                .map(ReactionStepDTO::getAppliedConditions)
                .filter(ac -> ac != null && ac.isAutoAdjusted())
                .findFirst()
                .orElse(null);

        return MixResponse.builder()
                .status("success")
                .reactionMode(mode)
                .stepCount(steps.size())
                .steps(steps)
                .appliedConditions(appliedConditions)
                .finalContents(finalContents)
                .ambiguityNoteVi(ambiguity)
                .build();
    }

    private String inferState(String formula) {
        if (formula.equalsIgnoreCase("H2O")) return "LIQUID";
        if (formula.endsWith("(g)") || formula.equalsIgnoreCase("CO2") || formula.equalsIgnoreCase("H2")) return "GAS";
        if (formula.endsWith("(s)")) return "SOLID";
        return "AQUEOUS";
    }

    // ─── Priority Logic ─────────────────────────────────────────────────────────

    private record Candidate(String a, String b, int idxA, int idxB, 
                             ReactionResultDTO result, AutoAppliedConditionsDTO conditions) {}

    private static class CandidateComparator implements Comparator<Candidate> {
        @Override
        public int compare(Candidate c1, Candidate c2) {
            // 1. Condition auto-adjust (false beats true)
            int adjCompare = Boolean.compare(c1.conditions.isAutoAdjusted(), c2.conditions.isAutoAdjusted());
            if (adjCompare != 0) return adjCompare;

            // 2. Confidence (higher beats lower)
            Double conf1 = c1.result.getConfidence() != null ? c1.result.getConfidence() : 0.0;
            Double conf2 = c2.result.getConfidence() != null ? c2.result.getConfidence() : 0.0;
            int confCompare = Double.compare(conf2, conf1); // reverse
            if (confCompare != 0) return confCompare;

            // 3. Effect Severity (higher beats lower)
            int sev1 = EFFECT_SEVERITY.getOrDefault(c1.result.getEffectType(), 1);
            int sev2 = EFFECT_SEVERITY.getOrDefault(c2.result.getEffectType(), 1);
            int sevCompare = Integer.compare(sev2, sev1); // reverse
            if (sevCompare != 0) return sevCompare;

            // 4. Index in array (lower sum beats higher)
            int idx1 = c1.idxA + c1.idxB;
            int idx2 = c2.idxA + c2.idxB;
            int idxCompare = Integer.compare(idx1, idx2);
            if (idxCompare != 0) return idxCompare;

            // 5. Lexical reaction key
            String k1 = ReactionKeyUtil.buildKey(c1.a, c1.b);
            String k2 = ReactionKeyUtil.buildKey(c2.a, c2.b);
            return k1.compareTo(k2);
        }
    }
}
