package com.recruitment.resume.repository;

import com.recruitment.resume.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {
    Optional<Resume> findFirstByCandidateIdOrderByCreatedAtDesc(UUID candidateId);
    List<Resume> findByStatus(Resume.ResumeStatus status);
}
