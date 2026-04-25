package com.example.virtualchemistrylab.controller;

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
@Tag(name = "Lab", description = "Pha trộn hóa chất và quản lý phiên thí nghiệm")
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
        description = "Kiểm tra backend đang chạy. Frontend gọi trước khi load trang.",
        tags = {"Health"}
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "Backend đang hoạt động bình thường",
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
        summary = "Pha trộn hóa chất",
        description = """
            **Endpoint chính** – Mô phỏng phản ứng khi đổ chất từ ống nghiệm này sang ống nghiệm khác.

            **Luồng xử lý:**
            1. Validate request (@NotBlank, @NotEmpty)
            2. Rate limit (1 lần / 2 giây mỗi session)
            3. Resolve chemical names (cache → PubChem → Cactus → OPSIN)
            4. Dự đoán phản ứng (cache → Google Gemini AI → validate)
            5. Lưu cache + log
            6. Trả MixResponse cho frontend chạy animation

            **effectType có thể nhận:**
            - `NONE` – không có hiện tượng
            - `GAS_BUBBLE` – sủi bọt khí
            - `PRECIPITATE` – kết tủa
            - `COLOR_CHANGE` – đổi màu
            - `HEAT` – toả nhiệt
            - `EXPLOSION` – nổ
            """
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Mô phỏng thành công"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Request không hợp lệ (thiếu field bắt buộc)"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Gọi quá nhanh – chờ 2 giây")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "Thông tin hai ống nghiệm cần pha trộn",
        required = true,
        content = @Content(
            schema = @Schema(implementation = MixRequest.class),
            examples = {
                @ExampleObject(name = "HCl + CaCO3 (Sủi bọt)", value = """
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
                @ExampleObject(name = "CuSO4 + NaOH (Kết tủa xanh)", value = """
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
                @ExampleObject(name = "AgNO3 + NaCl (Kết tủa trắng)", value = """
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
                @ExampleObject(name = "HCl + NaOH (Trung hoà)", value = """
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

    @Operation(
        summary = "Lấy lịch sử thí nghiệm",
        description = "Lấy toàn bộ log hành động của một phiên thí nghiệm, sắp xếp mới nhất trước."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Danh sách log (có thể rỗng nếu session mới)")
    })
    @GetMapping("/session/{sessionCode}/logs")
    public ResponseEntity<ApiResponse<List<ExperimentLog>>> getLogs(
            @Parameter(description = "Session code của người dùng", example = "demo-001")
            @PathVariable String sessionCode) {
        List<ExperimentLog> logs = experimentLogService.getLogsForSession(sessionCode);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    // ─── Session reset ────────────────────────────────────────────────────────────

    @Operation(
        summary = "Reset phiên thí nghiệm",
        description = "Đánh dấu phiên đã reset. Log trước đó vẫn được giữ trong DB để audit."
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
                .message("Đã reset phiên thí nghiệm.")
                .build());
    }
}
