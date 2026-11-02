package com.recruitment.job.repository;

import com.recruitment.job.model.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<JobPosting, UUID> {
    List<JobPosting> findByStatus(JobPosting.JobStatus status);
    List<JobPosting> findByRecruiterId(UUID recruiterId);
}
