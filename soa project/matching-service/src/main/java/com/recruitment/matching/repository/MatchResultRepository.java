package com.recruitment.matching.repository;

import com.recruitment.matching.model.MatchResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MatchResultRepository extends JpaRepository<MatchResult, UUID> {
    List<MatchResult> findByJobIdOrderByOverallScoreDesc(UUID jobId);
    List<MatchResult> findByCandidateIdOrderByOverallScoreDesc(UUID candidateId);
    Optional<MatchResult> findByJobIdAndCandidateId(UUID jobId, UUID candidateId);
}
