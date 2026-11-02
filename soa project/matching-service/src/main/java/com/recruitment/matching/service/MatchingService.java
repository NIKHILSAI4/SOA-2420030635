package com.recruitment.matching.service;

import com.recruitment.matching.client.JobClient;
import com.recruitment.matching.client.ResumeClient;
import com.recruitment.matching.dto.CandidateDto;
import com.recruitment.matching.dto.JobDto;
import com.recruitment.matching.dto.NlpSimilarityResponse;
import com.recruitment.matching.model.MatchResult;
import com.recruitment.matching.model.SkillMatchDetail;
import com.recruitment.matching.repository.MatchResultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchingService {

    private static final Logger log = LoggerFactory.getLogger(MatchingService.class);

    private final MatchResultRepository matchResultRepository;
    private final JobClient jobClient;
    private final ResumeClient resumeClient;
    private final RestTemplate restTemplate;

    @Value("${nlp.service.url:http://localhost:8000}")
    private String nlpServiceUrl;

    public MatchingService(MatchResultRepository matchResultRepository, JobClient jobClient, ResumeClient resumeClient) {
        this.matchResultRepository = matchResultRepository;
        this.jobClient = jobClient;
        this.resumeClient = resumeClient;
        this.restTemplate = new RestTemplate();
    }

    @Transactional
    public List<MatchResult> rankCandidatesForJob(UUID jobId) {
        JobDto job = jobClient.getJobById(jobId);
        if (job == null) {
            throw new IllegalArgumentException("Job not found with id: " + jobId);
        }

        List<CandidateDto> candidates = resumeClient.getAllProfiles();
        List<String> requiredSkills = job.getSkills() != null
                ? job.getSkills().stream().map(JobDto.JobSkillDto::getSkillName).collect(Collectors.toList())
                : Collections.emptyList();

        List<MatchResult> results = new ArrayList<>();

        for (CandidateDto cand : candidates) {
            // Check if existing record
            MatchResult match = matchResultRepository.findByJobIdAndCandidateId(jobId, cand.getCandidateId())
                    .orElse(new MatchResult());

            match.setJobId(jobId);
            match.setCandidateId(cand.getCandidateId());
            match.setCandidateName("Candidate #" + cand.getCandidateId().toString().substring(0, 8));
            match.getDetails().clear();

            // Call NLP Service for similarity
            NlpSimilarityResponse simResp = callNlpSimilarity(requiredSkills, cand.getSkills() != null ? cand.getSkills() : Collections.emptyList());

            double skillScore = simResp != null && simResp.getOverallSkillScore() != null
                    ? simResp.getOverallSkillScore()
                    : 0.0;

            // Calculate experience score
            double reqExp = job.getMinExperienceYears() != null ? job.getMinExperienceYears() : 0.0;
            double candExp = cand.getExperienceYears() != null ? cand.getExperienceYears() : 0.0;
            double expScore = 100.0;
            if (reqExp > 0) {
                expScore = candExp >= reqExp ? 100.0 : Math.min(100.0, (candExp / reqExp) * 100.0);
            }

            // Weighted Overall Score (70% Skills, 30% Experience)
            double overallScore = Math.round((0.70 * skillScore + 0.30 * expScore) * 10.0) / 10.0;

            match.setSkillScore(skillScore);
            match.setExperienceScore(expScore);
            match.setOverallScore(overallScore);

            int matchedCount = simResp != null && simResp.getMatchedSkills() != null ? simResp.getMatchedSkills().size() : 0;
            int missingCount = simResp != null && simResp.getMissingSkills() != null ? simResp.getMissingSkills().size() : 0;

            match.setMatchedCount(matchedCount);
            match.setMissingCount(missingCount);

            // Populate match details
            if (simResp != null && simResp.getSimilarityMatrix() != null) {
                for (Map.Entry<String, NlpSimilarityResponse.SkillMatchItem> entry : simResp.getSimilarityMatrix().entrySet()) {
                    String req = entry.getKey();
                    NlpSimilarityResponse.SkillMatchItem item = entry.getValue();

                    SkillMatchDetail.MatchType type = SkillMatchDetail.MatchType.MISSING;
                    if ("EXACT".equalsIgnoreCase(item.getMatchType())) {
                        type = SkillMatchDetail.MatchType.EXACT;
                    } else if ("SEMANTIC".equalsIgnoreCase(item.getMatchType())) {
                        type = SkillMatchDetail.MatchType.SEMANTIC;
                    }

                    match.addDetail(new SkillMatchDetail(
                            req,
                            type,
                            item.getMatchedWith(),
                            item.getScore(),
                            item.getExplanation()
                    ));
                }
            }

            // Generate narrative explanation
            String explanation = String.format(
                    "Overall Compatibility: %.1f%% (Skills: %.1f%%, Experience: %.1f%%). Matched %d/%d required skills. Candidate has %.1f yrs experience (required: %.1f yrs).",
                    overallScore, skillScore, expScore, matchedCount, requiredSkills.size(), candExp, reqExp
            );
            match.setExplanation(explanation);

            results.add(matchResultRepository.save(match));
        }

        // Return sorted descending
        results.sort((a, b) -> Double.compare(b.getOverallScore(), a.getOverallScore()));
        return results;
    }

    public List<MatchResult> getRankingsByJob(UUID jobId) {
        return matchResultRepository.findByJobIdOrderByOverallScoreDesc(jobId);
    }

    public List<Map<String, Object>> getRecommendedJobsForCandidate(UUID candidateId) {
        List<JobDto> jobs = jobClient.getAllJobs();
        List<CandidateDto> candidates = resumeClient.getAllProfiles();
        CandidateDto targetCandidate = candidates.stream()
                .filter(c -> c.getCandidateId().equals(candidateId))
                .findFirst()
                .orElse(null);

        if (targetCandidate == null) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> recommendations = new ArrayList<>();

        for (JobDto job : jobs) {
            List<String> required = job.getSkills() != null
                    ? job.getSkills().stream().map(JobDto.JobSkillDto::getSkillName).toList()
                    : Collections.emptyList();

            NlpSimilarityResponse sim = callNlpSimilarity(required, targetCandidate.getSkills() != null ? targetCandidate.getSkills() : Collections.emptyList());

            double skillScore = sim != null && sim.getOverallSkillScore() != null ? sim.getOverallSkillScore() : 0.0;
            double reqExp = job.getMinExperienceYears() != null ? job.getMinExperienceYears() : 0.0;
            double candExp = targetCandidate.getExperienceYears() != null ? targetCandidate.getExperienceYears() : 0.0;
            double expScore = reqExp > 0 ? (candExp >= reqExp ? 100.0 : (candExp / reqExp) * 100.0) : 100.0;
            double score = Math.round((0.70 * skillScore + 0.30 * expScore) * 10.0) / 10.0;

            Map<String, Object> item = new HashMap<>();
            item.put("jobId", job.getId());
            item.put("jobTitle", job.getTitle());
            item.put("department", job.getDepartment());
            item.put("location", job.getLocation());
            item.put("compatibilityScore", score);
            item.put("matchedSkills", sim != null ? sim.getMatchedSkills() : Collections.emptyList());
            item.put("missingSkills", sim != null ? sim.getMissingSkills() : Collections.emptyList());
            recommendations.add(item);
        }

        recommendations.sort((a, b) -> Double.compare((Double) b.get("compatibilityScore"), (Double) a.get("compatibilityScore")));
        return recommendations;
    }

    private NlpSimilarityResponse callNlpSimilarity(List<String> jobSkills, List<String> candidateSkills) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> body = Map.of(
                    "jobSkills", jobSkills,
                    "candidateSkills", candidateSkills
            );
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            return restTemplate.postForObject(
                    nlpServiceUrl + "/nlp/similarity",
                    request,
                    NlpSimilarityResponse.class
            );
        } catch (Exception e) {
            log.warn("NLP Service unavailable for similarity call, using fallback exact match", e);
            // Fallback exact match
            int matchCount = 0;
            for (String req : jobSkills) {
                if (candidateSkills.stream().anyMatch(c -> c.equalsIgnoreCase(req))) {
                    matchCount++;
                }
            }
            double score = jobSkills.isEmpty() ? 100.0 : ((double) matchCount / jobSkills.size()) * 100.0;
            NlpSimilarityResponse fallback = new NlpSimilarityResponse();
            fallback.setOverallSkillScore(score);
            fallback.setMatchedSkills(candidateSkills);
            fallback.setMissingSkills(Collections.emptyList());
            return fallback;
        }
    }
}
