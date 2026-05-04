package com.virtualchemistrylab.controller;

import com.virtualchemistrylab.dto.MixRequest;
import com.virtualchemistrylab.dto.MixResponse;
import com.virtualchemistrylab.service.LabMixService;
import com.virtualchemistrylab.service.ExperimentLogService;
import com.virtualchemistrylab.dto.ApiResponse;
import com.virtualchemistrylab.entity.ExperimentLog;
import com.virtualchemistrylab.repository.ExperimentSessionRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Lab controller – handles mixing and session operations.
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Lab", description = "Mix chemicals and manage experiment sessions")
public class LabController {

    private final LabMixService labMixService;
    private final ExperimentLogService experimentLogService;
    private final ExperimentSessionRepository sessionRepository;

    public LabController(LabMixService labMixService,
                         ExperimentLogService experimentLogService,
                         ExperimentSessionRepository sessionRepository) {
        this.labMixService = labMixService;
        this.experimentLogService = experimentLogService;
        this.sessionRepository = sessionRepository;
    }

    // ─── Health ─────────────────────────────────────────────────────────────────

    @Operation(
        summary = "Health check",
        description = "Check if backend is running. Called by frontend before page load.",
        tags = {"Health"}
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Backend is running normally",
        content = @Content(examples = @ExampleObject(
            value = "{\"status\":\"ok\",\"service\":\"virtual-chemistry-lab-backend\"}"
        ))
    )
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "service", "virtual-chemistry-lab-backend"
        ));
    }

    // ─── Mix ────────────────────────────────────────────────────────────────────

    @Operation(
        summary = "Mix chemicals",
        description = """
            **Main endpoint** - Simulates a reaction when pouring chemicals from one test tube to another.

            **Processing flow:**
            1. Validate request (@NotBlank, @NotEmpty)
            2. Rate limit (1 request / 2 seconds per session)
            3. Resolve chemical names (cache -> PubChem -> Cactus -> OPSIN)
            4. Predict reaction (cache -> Google Gemini AI -> validate)
            5. Save cache + log
            6. Return MixResponse for frontend animation

            **Possible effectType values:**
            - `NONE` - no observable phenomenon
            - `GAS_BUBBLE` - gas bubbles
            - `PRECIPITATE` - precipitate formation
            - `COLOR_CHANGE` - color change
            - `HEAT` - exothermic reaction
            - `EXPLOSION` - explosion
            """
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Simulation successful"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request (missing required fields)"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Too many requests - wait 2 seconds")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "Information about the two test tubes to mix",
        required = true,
        content = @Content(
            schema = @Schema(implementation = MixRequest.class),
            examples = {
                @ExampleObject(name = "HCl + CaCO3 (Gas bubbles)", value = """
                    {
                      "sessionCode": "demo-001",
                      "sourceVesselId": "tube-a",
                      "targetVesselId": "tube-b",
                      "sourceContents": [
                        { "inputName": "HCl", "formula": "HCl", "amountMl": 10 }
                      ],
                      "targetContents": [
                        { "inputName": "CaCO3", "formula": "CaCO3", "amountMl": 5 }
                      ]
                    }
                    """),
                @ExampleObject(name = "CuSO4 + NaOH (Blue precipitate)", value = """
                    {
                      "sessionCode": "demo-001",
                      "sourceVesselId": "tube-c",
                      "targetVesselId": "tube-d",
                      "sourceContents": [
                        { "inputName": "CuSO4", "formula": "CuSO4", "amountMl": 10 }
                      ],
                      "targetContents": [
                        { "inputName": "NaOH", "formula": "NaOH", "amountMl": 10 }
                      ]
                    }
                    """),
                @ExampleObject(name = "AgNO3 + NaCl (White precipitate)", value = """
                    {
                      "sessionCode": "demo-001",
                      "sourceVesselId": "tube-e",
                      "targetVesselId": "tube-f",
                      "sourceContents": [
                        { "inputName": "AgNO3", "formula": "AgNO3", "amountMl": 5 }
                      ],
                      "targetContents": [
                        { "inputName": "NaCl", "formula": "NaCl", "amountMl": 5 }
                      ]
                    }
                    """),
                @ExampleObject(name = "HCl + NaOH (Neutralization)", value = """
                    {
                      "sessionCode": "demo-001",
                      "sourceVesselId": "tube-g",
                      "targetVesselId": "tube-h",
                      "sourceContents": [
                        { "inputName": "HCl", "formula": "HCl", "amountMl": 10 }
                      ],
                      "targetContents": [
                        { "inputName": "NaOH", "formula": "NaOH", "amountMl": 10 }
                      ]
                    }
                    """)
            }
        )
    )
    @PostMapping("/lab/mix")
    public ResponseEntity<MixResponse> mix(@Valid @RequestBody MixRequest request) {
        MixResponse response = labMixService.mix(request);
        return ResponseEntity.ok(response);
    }

    // ─── Session logs ────────────────────────────────────────────────────────────

    // Fix: 3 (Create ExperimentLogDTO and stop exposing JPA entities)
    public record ExperimentLogDTO(Long id, String actionType, java.time.LocalDateTime createdAt) {}

    @Operation(
        summary = "Get experiment history",
        description = "Retrieve all action logs for an experiment session, sorted by most recent first."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List of logs (may be empty for new sessions)")
    })
    @GetMapping("/session/{sessionCode}/logs")
    public ResponseEntity<ApiResponse<List<ExperimentLogDTO>>> getLogs(
            @Parameter(description = "User's session code", example = "demo-001")
            @PathVariable String sessionCode) {
        List<ExperimentLogDTO> logs = experimentLogService.getLogsForSession(sessionCode).stream()
                .map(log -> new ExperimentLogDTO(log.getId(), log.getActionType(), log.getCreatedAt()))
                .toList(); // Fix: 3
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    // ─── Session reset ────────────────────────────────────────────────────────────

    @Operation(
        summary = "Reset experiment session",
        description = "Mark session as reset. Previous logs are kept in DB for audit."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(examples = @ExampleObject(value = "{\"sessionCode\":\"demo-001\"}"))
    )
    @PostMapping("/session/reset")
    public ResponseEntity<ApiResponse<Void>> resetSession(
            @RequestBody Map<String, String> body) {
        String sessionCode = body.get("sessionCode");
        if (sessionCode == null || sessionCode.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("sessionCode is required"));
        }
        experimentLogService.log(sessionCode, "SESSION_RESET", body, null);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status("success")
                .message("Experiment session has been reset.")
                .build());
    }
}
