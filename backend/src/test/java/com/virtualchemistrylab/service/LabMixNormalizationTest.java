package com.virtualchemistrylab.service;

import com.virtualchemistrylab.dto.MixRequest;
import com.virtualchemistrylab.dto.MixResponse;
import com.virtualchemistrylab.dto.VesselContentDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "app.ai.mock-mode=true"
})
class LabMixNormalizationTest {

    @Autowired
    private LabMixService labMixService;

    @Autowired
    private com.virtualchemistrylab.repository.ChemicalCacheRepository chemicalCacheRepository;

    @org.junit.jupiter.api.BeforeEach
    void setup() {
        chemicalCacheRepository.deleteAll();
        // Seed Copper Sulfate -> CuSO4
        chemicalCacheRepository.save(com.virtualchemistrylab.entity.ChemicalCache.builder()
                .inputQuery("Copper Sulfate")
                .canonicalFormula("CuSO4")
                .canonicalName("Copper(II) Sulfate")
                .source("TEST_SEED")
                .build());
        
        // Seed NaOH -> NaOH (đảm bảo không bị biến thành HNaO)
        chemicalCacheRepository.save(com.virtualchemistrylab.entity.ChemicalCache.builder()
                .inputQuery("NaOH")
                .canonicalFormula("NaOH")
                .canonicalName("Sodium Hydroxide")
                .source("TEST_SEED")
                .build());
    }

    @Test
    void shouldNormalizeChemicalNamesBeforeReaction() {
        // Gửi "Copper Sulfate" (tên thô) thay vì "CuSO4"
        MixRequest request = MixRequest.builder()
                .sessionCode("test-session")
                .sourceVesselId("v1")
                .targetVesselId("v2")
                .sourceContents(List.of(new VesselContentDTO("Copper Sulfate", "Copper Sulfate", 10.0)))
                .targetContents(List.of(new VesselContentDTO("NaOH", "NaOH", 10.0)))
                .temperature(25.0)
                .pressure(1.0)
                .catalyst("Không")
                .build();

        MixResponse response = labMixService.mix(request);

        // Kiểm tra kết quả
        assertNotNull(response.getResult());
        assertTrue(response.getResult().getHasReaction(), "Nên có phản ứng giữa Copper Sulfate và NaOH");
        assertTrue(response.getResult().getEquation().contains("Cu(OH)2"), 
            "Phương trình phải chứa Cu(OH)2. Thực tế: " + (response.getResult() != null ? response.getResult().getEquation() : "null"));
    }
}
