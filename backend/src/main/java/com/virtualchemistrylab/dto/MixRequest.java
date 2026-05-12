package com.virtualchemistrylab.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

/**
 * Incoming request payload for POST /api/lab/mix.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MixRequest {

    @NotBlank(message = "sessionCode must not be blank")
    private String sessionCode;

    @NotBlank(message = "sourceVesselId must not be blank")
    private String sourceVesselId;

    @NotBlank(message = "targetVesselId must not be blank")
    private String targetVesselId;

    @Valid
    @NotEmpty(message = "sourceContents must not be empty") // Fix: 1
    @Size(max = 10, message = "sourceContents must not exceed 10 items") // Fix: 4
    private List<VesselContentDTO> sourceContents;

    @Valid
    @NotEmpty(message = "targetContents must not be empty") // Fix: 1
    @Size(max = 10, message = "targetContents must not exceed 10 items") // Fix: 4
    private List<VesselContentDTO> targetContents;

    private Double temperature;
    private Double pressure;
    private String catalyst;
}
