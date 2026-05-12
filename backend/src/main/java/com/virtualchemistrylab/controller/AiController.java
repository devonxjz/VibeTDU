package com.virtualchemistrylab.controller;

import com.virtualchemistrylab.dto.AiChatRequest;
import com.virtualchemistrylab.dto.AiChatResponse;
import com.virtualchemistrylab.dto.AiAskRequest;
import com.virtualchemistrylab.dto.AiAskResponse;
import com.virtualchemistrylab.service.AiInterpretationService;
import com.virtualchemistrylab.service.ExperimentLogService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AI controller – handles open-ended chemistry Q&A questions.
 */
@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI", description = "Chemistry Q&A via Google Gemini AI")
public class AiController {

    private final AiInterpretationService aiInterpretationService;
    private final ExperimentLogService experimentLogService;
    public AiController(AiInterpretationService aiInterpretationService,
                        ExperimentLogService experimentLogService) {
        this.aiInterpretationService = aiInterpretationService;
        this.experimentLogService = experimentLogService;
    }

    @Operation(
        summary = "Ask AI about chemical reactions",
        description = """
            Send a question about chemical phenomena.
            AI will respond based on the provided reaction context.

            **Mock mode (default):** Returns sample response without internet.
            **Real mode:** Connects to Google Gemini for accurate answers.
            """
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "AI answered successfully",
            content = @Content(examples = @ExampleObject(value = """
                {
                  "status": "success",
                  "answerVi": "Gas bubbles appear because the reaction produces CO2 gas. CO2 escapes from the solution, causing the bubbling phenomenon."
                }
                """))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "sessionCode or question is empty")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "Question and reaction context",
        required = true,
        content = @Content(
            examples = {
                @ExampleObject(name = "Ask about CO2 bubbles", value = """
                    {
                      "sessionCode": "demo-001",
                      "reactionContext": {
                        "equation": "2HCl + CaCO3 -> CaCl2 + CO2 + H2O",
                        "effectType": "GAS_BUBBLE",
                        "messageVi": "CO2 gas is released."
                      },
                      "question": "Why are there gas bubbles?"
                    }
                    """),
                @ExampleObject(name = "Ask about blue precipitate", value = """
                    {
                      "sessionCode": "demo-001",
                      "reactionContext": {
                        "equation": "CuSO4 + 2NaOH -> Cu(OH)2 + Na2SO4",
                        "effectType": "PRECIPITATE",
                        "messageVi": "Blue precipitate Cu(OH)2 appears."
                      },
                      "question": "Why is the precipitate blue?"
                    }
                    """),
                @ExampleObject(name = "Ask without context", value = """
                    {
                      "sessionCode": "demo-001",
                      "question": "What is NaOH? Is it dangerous?"
                    }
                    """)
            }
        )
    )
    @PostMapping("/ask")
    public ResponseEntity<AiAskResponse> ask(@Valid @RequestBody AiAskRequest request) {
        String answer = aiInterpretationService.answer(
                request.getQuestion(),
                request.getReactionContext());

        AiAskResponse response = AiAskResponse.builder()
                .status("success")
                .answerVi(answer)
                .build();

        experimentLogService.log(request.getSessionCode(), "AI_ASK", request, response);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@Valid @RequestBody AiChatRequest request) {

        String answer = aiInterpretationService.chat(
                request.getMessages(),
                request.getReactionContext());

        AiChatResponse response = AiChatResponse.builder()
                .status("success")
                .answerVi(answer)
                .build();

        experimentLogService.log(request.getSessionCode(), "AI_CHAT", request, response);

        return ResponseEntity.ok(response);
    }
}
