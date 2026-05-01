package com.virtualchemistrylab.controller;

import com.virtualchemistrylab.dto.ApiResponse;
import com.virtualchemistrylab.service.ChemicalResolverService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Chemical controller – exposes chemical resolution as a standalone endpoint.
 */
@RestController
@RequestMapping("/api/chemicals")
@Tag(name = "Chemical", description = "Look up and canonicalize chemical names/formulas")
public class ChemicalController {

    private final ChemicalResolverService chemicalResolverService;

    public ChemicalController(ChemicalResolverService chemicalResolverService) {
        this.chemicalResolverService = chemicalResolverService;
    }

    @Operation(
        summary = "Resolve chemical name",
        description = """
            Canonicalize a chemical name or formula.

            **Flow:** DB Cache -> PubChem -> Cactus -> OPSIN -> Minimal fallback

            **Example queries:**
            - `NaOH` -> Sodium hydroxide
            - `sodium hydroxide` -> NaOH
            - `H2SO4` -> Sulfuric acid
            - `CaCO3` -> Calcium carbonate
            """
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Resolved successfully (cached=true if from cache)",
            content = @Content(examples = {
                @ExampleObject(name = "Cache miss (PubChem)", value = """
                    {
                      "status": "success",
                      "cached": false,
                      "data": {
                        "input": "NaOH",
                        "canonicalFormula": "NaOH",
                        "canonicalName": "sodium hydroxide",
                        "smiles": "[Na+].[OH-]",
                        "inchi": "InChI=1S/Na.H2O/h;1H/q+1;/p-1",
                        "inchiKey": "HEMHJVSKTPXQMS-UHFFFAOYSA-M",
                        "source": "PUBCHEM"
                      }
                    }
                    """),
                @ExampleObject(name = "Cache hit", value = """
                    {
                      "status": "success",
                      "cached": true,
                      "data": {
                        "input": "NaOH",
                        "canonicalFormula": "NaOH",
                        "canonicalName": "sodium hydroxide",
                        "source": "CACHE"
                      }
                    }
                    """)
            })
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "query is empty")
    })
    @GetMapping("/resolve")
    public ResponseEntity<Map<String, Object>> resolve(
            @Parameter(
                description = "Chemical name or formula to look up",
                required = true,
                examples = {
                    @ExampleObject(name = "NaOH",  value = "NaOH"),
                    @ExampleObject(name = "H2SO4", value = "H2SO4"),
                    @ExampleObject(name = "CaCO3", value = "CaCO3"),
                    @ExampleObject(name = "HCl",   value = "HCl"),
                    @ExampleObject(name = "AgNO3", value = "AgNO3"),
                    @ExampleObject(name = "CuSO4", value = "CuSO4")
                }
            )
            @RequestParam(name = "query") String query) {

        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "query parameter must not be blank"
            ));
        }

        ChemicalResolverService.ResolveResult result =
                chemicalResolverService.resolve(query.trim());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "success");
        response.put("cached", result.cached());
        response.put("data", result.info());
        return ResponseEntity.ok(response);
    }
}
