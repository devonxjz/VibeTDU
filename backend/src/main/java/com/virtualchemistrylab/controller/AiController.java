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

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AI controller – handles open-ended chemistry Q&A questions.
 */
@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI", description = "Hỏi đáp hóa học bằng tiếng Việt qua Google Gemini AI")
public class AiController {

    private final AiInterpretationService aiInterpretationService;
    private final ExperimentLogService experimentLogService;

    public AiController(AiInterpretationService aiInterpretationService,
                        ExperimentLogService experimentLogService) {
        this.aiInterpretationService = aiInterpretationService;
        this.experimentLogService = experimentLogService;
    }

    @Operation(
        summary = "Hỏi AI về phản ứng hóa học",
        description = """
            Gửi câu hỏi tiếng Việt về hiện tượng hóa học.
            AI sẽ trả lời dựa trên ngữ cảnh phản ứng được cung cấp.

            **Mock mode (mặc định):** Trả lời mẫu không cần internet.
            **Real mode:** Kết nối Google Gemini để có câu trả lời chính xác.
            """
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "AI trả lời thành công bằng tiếng Việt",
            content = @Content(examples = @ExampleObject(value = """
                {
                  "status": "success",
                  "answerVi": "Bọt khí xuất hiện vì phản ứng tạo ra khí CO2. Khí CO2 thoát ra khỏi dung dịch nên bạn thấy hiện tượng sủi bọt."
                }
                """))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "sessionCode hoặc question rỗng")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "Câu hỏi và ngữ cảnh phản ứng",
        required = true,
        content = @Content(
            examples = {
                @ExampleObject(name = "Hỏi về bọt khí CO2", value = """
                    {
                      "sessionCode": "demo-001",
                      "reactionContext": {
                        "equation": "2HCl + CaCO3 → CaCl2 + CO2↑ + H2O",
                        "effectType": "GAS_BUBBLE",
                        "messageVi": "Có khí CO2 thoát ra."
                      },
                      "question": "Tại sao lại có bọt khí?"
                    }
                    """),
                @ExampleObject(name = "Hỏi về kết tủa xanh", value = """
                    {
                      "sessionCode": "demo-001",
                      "reactionContext": {
                        "equation": "CuSO4 + 2NaOH → Cu(OH)2↓ + Na2SO4",
                        "effectType": "PRECIPITATE",
                        "messageVi": "Xuất hiện kết tủa xanh lam Cu(OH)2."
                      },
                      "question": "Tại sao kết tủa có màu xanh lam?"
                    }
                    """),
                @ExampleObject(name = "Hỏi không có ngữ cảnh", value = """
                    {
                      "sessionCode": "demo-001",
                      "question": "NaOH là gì? Có nguy hiểm không?"
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
