package com.virtualchemistrylab.controller;

import com.virtualchemistrylab.service.ReactionSeederService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ReactionSeederService reactionSeederService;

    public AdminController(ReactionSeederService reactionSeederService) {
        this.reactionSeederService = reactionSeederService;
    }

    @PostMapping("/seed-reactions")
    public ResponseEntity<?> triggerReactionSeeding() {
        // Run the seeding process in a background thread
        reactionSeederService.startSeeding();
        
        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Reaction seeding process started in the background. Check server logs for progress."
        ));
    }
}
