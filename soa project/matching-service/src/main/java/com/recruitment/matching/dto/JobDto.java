package com.recruitment.matching.dto;

import java.util.List;
import java.util.UUID;

public class JobDto {
    private UUID id;
    private String title;
    private String department;
    private String description;
    private String location;
    private Double minExperienceYears;
    private List<JobSkillDto> skills;

    public static class JobSkillDto {
        private String skillName;
        private Boolean isMandatory;
        private Double weight;

        public JobSkillDto() {}

        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }
        public Boolean getIsMandatory() { return isMandatory; }
        public void setIsMandatory(Boolean isMandatory) { this.isMandatory = isMandatory; }
        public Double getWeight() { return weight; }
        public void setWeight(Double weight) { this.weight = weight; }
    }

    public JobDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Double getMinExperienceYears() { return minExperienceYears; }
    public void setMinExperienceYears(Double minExperienceYears) { this.minExperienceYears = minExperienceYears; }
    public List<JobSkillDto> getSkills() { return skills; }
    public void setSkills(List<JobSkillDto> skills) { this.skills = skills; }
}
