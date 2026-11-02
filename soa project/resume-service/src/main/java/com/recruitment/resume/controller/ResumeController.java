package com.recruitment.resume.controller;

import com.recruitment.resume.dto.CandidateProfileDto;
import com.recruitment.resume.model.Resume;
import com.recruitment.resume.service.ResumeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "File cannot be empty"));
        }

        UUID candidateId = (userIdHeader != null && !userIdHeader.isBlank())
                ? UUID.fromString(userIdHeader)
                : UUID.randomUUID();

        try {
            Resume resume = resumeService.uploadResume(candidateId, file);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                    "resumeId", resume.getId(),
                    "candidateId", resume.getCandidateId(),
                    "status", resume.getStatus(),
                    "message", "Resume uploaded successfully. Extraction in progress."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload resume: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<?> getStatus(@PathVariable UUID id) {
        try {
            Resume resume = resumeService.getResumeById(id);
            return ResponseEntity.ok(Map.of(
                    "id", resume.getId(),
                    "status", resume.getStatus(),
                    "experienceYears", resume.getExperienceYears(),
                    "skills", resume.getExtractedSkills().stream().map(s -> s.getSkillName()).toList(),
                    "errorMessage", resume.getErrorMessage() != null ? resume.getErrorMessage() : ""
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        try {
            UUID candidateId = UUID.fromString(userIdHeader);
            Resume resume = resumeService.getLatestResume(candidateId);
            return ResponseEntity.ok(resume);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profiles")
    public ResponseEntity<List<CandidateProfileDto>> getAllProfiles() {
        return ResponseEntity.ok(resumeService.getAllParsedProfiles());
    }
}
