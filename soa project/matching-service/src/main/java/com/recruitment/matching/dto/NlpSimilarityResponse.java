package com.recruitment.matching.dto;

import java.util.List;
import java.util.Map;

public class NlpSimilarityResponse {
    private Map<String, SkillMatchItem> similarityMatrix;
    private Double overallSkillScore;
    private List<String> matchedSkills;
    private List<String> missingSkills;

    public static class SkillMatchItem {
        private String matchedWith;
        private Double score;
        private String matchType;
        private String explanation;

        public SkillMatchItem() {}

        public String getMatchedWith() { return matchedWith; }
        public void setMatchedWith(String matchedWith) { this.matchedWith = matchedWith; }
        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }
        public String getMatchType() { return matchType; }
        public void setMatchType(String matchType) { this.matchType = matchType; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    public NlpSimilarityResponse() {}

    public Map<String, SkillMatchItem> getSimilarityMatrix() { return similarityMatrix; }
    public void setSimilarityMatrix(Map<String, SkillMatchItem> similarityMatrix) { this.similarityMatrix = similarityMatrix; }
    public Double getOverallSkillScore() { return overallSkillScore; }
    public void setOverallSkillScore(Double overallSkillScore) { this.overallSkillScore = overallSkillScore; }
    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }
    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }
}
