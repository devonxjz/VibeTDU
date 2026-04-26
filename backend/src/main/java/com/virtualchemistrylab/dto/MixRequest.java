package com.virtualchemistrylab.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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

    @NotEmpty(message = "sourceContents must not be empty")
    @Valid
    private List<VesselContentDTO> sourceContents;

    @NotEmpty(message = "targetContents must not be empty")
    @Valid
    private List<VesselContentDTO> targetContents;

    private Double temperature;
    private Double pressure;
    private String catalyst;
}
