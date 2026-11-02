package com.recruitment.matching.controller;

import com.recruitment.matching.model.MatchResult;
import com.recruitment.matching.service.MatchingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/matches")
public class MatchController {

    private final MatchingService matchingService;

    public MatchController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @PostMapping("/rank/{jobId}")
    public ResponseEntity<?> rankCandidates(@PathVariable UUID jobId) {
        try {
            List<MatchResult> ranked = matchingService.rankCandidatesForJob(jobId);
            return ResponseEntity.ok(ranked);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/rankings/{jobId}")
    public ResponseEntity<List<MatchResult>> getRankings(@PathVariable UUID jobId) {
        return ResponseEntity.ok(matchingService.getRankingsByJob(jobId));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Candidate authentication required"));
        }
        UUID candidateId = UUID.fromString(userIdHeader);
        return ResponseEntity.ok(matchingService.getRecommendedJobsForCandidate(candidateId));
    }
}
