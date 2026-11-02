package com.recruitment.resume.dto;

import java.util.List;
import java.util.Map;

public class NlpExtractResponse {
    private List<String> skills;
    private Map<String, List<String>> skillCategories;
    private Double experienceYears;
    private List<String> education;
    private List<String> certifications;
    private List<String> projects;

    public NlpExtractResponse() {
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public Map<String, List<String>> getSkillCategories() {
        return skillCategories;
    }

    public void setSkillCategories(Map<String, List<String>> skillCategories) {
        this.skillCategories = skillCategories;
    }

    public Double getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Double experienceYears) {
        this.experienceYears = experienceYears;
    }

    public List<String> getEducation() {
        return education;
    }

    public void setEducation(List<String> education) {
        this.education = education;
    }

    public List<String> getCertifications() {
        return certifications;
    }

    public void setCertifications(List<String> certifications) {
        this.certifications = certifications;
    }

    public List<String> getProjects() {
        return projects;
    }

    public void setProjects(List<String> projects) {
        this.projects = projects;
    }
}
