package com.recruitment.matching.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "skill_match_details")
public class SkillMatchDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_result_id", nullable = false)
    @JsonIgnore
    private MatchResult matchResult;

    @Column(nullable = false)
    private String requiredSkill;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchType matchType = MatchType.MISSING;

    private String candidateSkill;
    private Double similarityScore = 0.0;
    private String explanation;

    public enum MatchType {
        EXACT, SEMANTIC, MISSING
    }

    public SkillMatchDetail() {
    }

    public SkillMatchDetail(String requiredSkill, MatchType matchType, String candidateSkill, Double similarityScore, String explanation) {
        this.requiredSkill = requiredSkill;
        this.matchType = matchType;
        this.candidateSkill = candidateSkill;
        this.similarityScore = similarityScore;
        this.explanation = explanation;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public MatchResult getMatchResult() {
        return matchResult;
    }

    public void setMatchResult(MatchResult matchResult) {
        this.matchResult = matchResult;
    }

    public String getRequiredSkill() {
        return requiredSkill;
    }

    public void setRequiredSkill(String requiredSkill) {
        this.requiredSkill = requiredSkill;
    }

    public MatchType getMatchType() {
        return matchType;
    }

    public void setMatchType(MatchType matchType) {
        this.matchType = matchType;
    }

    public String getCandidateSkill() {
        return candidateSkill;
    }

    public void setCandidateSkill(String candidateSkill) {
        this.candidateSkill = candidateSkill;
    }

    public Double getSimilarityScore() {
        return similarityScore;
    }

    public void setSimilarityScore(Double similarityScore) {
        this.similarityScore = similarityScore;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
