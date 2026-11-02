package com.recruitment.resume.dto;

import java.util.List;
import java.util.UUID;

public class CandidateProfileDto {
    private UUID resumeId;
    private UUID candidateId;
    private String originalFilename;
    private Double experienceYears;
    private List<String> skills;
    private String status;

    public CandidateProfileDto() {
    }

    public CandidateProfileDto(UUID resumeId, UUID candidateId, String originalFilename, Double experienceYears, List<String> skills, String status) {
        this.resumeId = resumeId;
        this.candidateId = candidateId;
        this.originalFilename = originalFilename;
        this.experienceYears = experienceYears;
        this.skills = skills;
        this.status = status;
    }

    public UUID getResumeId() {
        return resumeId;
    }

    public void setResumeId(UUID resumeId) {
        this.resumeId = resumeId;
    }

    public UUID getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(UUID candidateId) {
        this.candidateId = candidateId;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public Double getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Double experienceYears) {
        this.experienceYears = experienceYears;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
