package com.recruitment.matching.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public class CandidateDto {
    private UUID resumeId;
    private UUID candidateId;
    private String originalFilename;
    private Double experienceYears;
    private List<String> skills;

    public CandidateDto() {}

    public UUID getResumeId() { return resumeId; }
    public void setResumeId(UUID resumeId) { this.resumeId = resumeId; }
    public UUID getCandidateId() { return candidateId; }
    public void setCandidateId(UUID candidateId) { this.candidateId = candidateId; }
    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }
    public Double getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Double experienceYears) { this.experienceYears = experienceYears; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
}
