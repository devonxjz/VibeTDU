package com.virtualchemistrylab.service;

import com.virtualchemistrylab.dto.AutoAppliedConditionsDTO;
import com.virtualchemistrylab.dto.ReactionResultDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Evaluates whether user conditions meet the reaction's required conditions.
 * If not, it auto-adjusts the conditions and provides a reason.
 */
@Service
public class ReactionConditionService {

    /**
     * Checks if the given reaction requires conditions that the user hasn't met.
     * Auto-adjusts the output conditions if necessary.
     */
    public AutoAppliedConditionsDTO evaluate(ReactionResultDTO reaction, Double userTemp, Double userPressure, String userCatalyst) {
        AutoAppliedConditionsDTO result = AutoAppliedConditionsDTO.builder()
                .temperature(userTemp)
                .pressure(userPressure)
                .catalyst(userCatalyst)
                .autoAdjusted(false)
                .build();

        if (reaction == null) {
            return result;
        }

        List<String> reasons = new ArrayList<>();
        boolean adjusted = false;

        // Check Temperature
        Double reqTemp = reaction.getRequiredTemperatureMin();
        if (reqTemp != null && (userTemp == null || userTemp < reqTemp)) {
            result.setTemperature(reqTemp);
            adjusted = true;
            String label = reaction.getRequiredTemperatureLabel() != null ? 
                           reaction.getRequiredTemperatureLabel() : String.valueOf(reqTemp) + "°C";
            reasons.add("nhiệt độ " + label);
        }

        // Check Pressure
        Double reqPressure = reaction.getRequiredPressureMin();
        if (reqPressure != null && (userPressure == null || userPressure < reqPressure)) {
            result.setPressure(reqPressure);
            adjusted = true;
            reasons.add("áp suất " + reqPressure + " atm");
        }

        // Check Catalyst
        String reqCatalyst = reaction.getRequiredCatalyst();
        if (reqCatalyst != null && !reqCatalyst.isBlank() && 
            (userCatalyst == null || !userCatalyst.equalsIgnoreCase(reqCatalyst) && !userCatalyst.contains(reqCatalyst))) {
            result.setCatalyst(reqCatalyst);
            adjusted = true;
            reasons.add("xúc tác " + reqCatalyst);
        }

        if (adjusted) {
            result.setAutoAdjusted(true);
            result.setReasonVi("Hệ thống đã tự động áp dụng: " + String.join(", ", reasons) + " để phản ứng có thể xảy ra.");
        }

        return result;
    }
}
