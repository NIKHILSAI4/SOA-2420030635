package com.recruitment.job.service;

import com.recruitment.job.dto.CreateJobRequest;
import com.recruitment.job.model.JobPosting;
import com.recruitment.job.model.JobSkill;
import com.recruitment.job.repository.JobRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class JobService {

    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @Transactional
    public JobPosting createJob(UUID recruiterId, CreateJobRequest request) {
        JobPosting job = new JobPosting();
        job.setRecruiterId(recruiterId);
        job.setTitle(request.getTitle());
        job.setDepartment(request.getDepartment());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setMinExperienceYears(request.getMinExperienceYears());
        job.setStatus(JobPosting.JobStatus.ACTIVE);

        if (request.getRequiredSkills() != null) {
            for (String skill : request.getRequiredSkills()) {
                if (skill != null && !skill.isBlank()) {
                    job.addSkill(new JobSkill(skill.trim(), "REQUIRED", true, 1.0));
                }
            }
        }

        if (request.getPreferredSkills() != null) {
            for (String skill : request.getPreferredSkills()) {
                if (skill != null && !skill.isBlank()) {
                    job.addSkill(new JobSkill(skill.trim(), "PREFERRED", false, 0.5));
                }
            }
        }

        return jobRepository.save(job);
    }

    public List<JobPosting> getAllActiveJobs() {
        return jobRepository.findByStatus(JobPosting.JobStatus.ACTIVE);
    }

    public List<JobPosting> getJobsByRecruiter(UUID recruiterId) {
        return jobRepository.findByRecruiterId(recruiterId);
    }

    public JobPosting getJobById(UUID id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with id: " + id));
    }

    @Transactional
    public JobPosting updateStatus(UUID id, JobPosting.JobStatus status) {
        JobPosting job = getJobById(id);
        job.setStatus(status);
        return jobRepository.save(job);
    }

    @Transactional
    public void deleteJob(UUID id) {
        JobPosting job = getJobById(id);
        job.setStatus(JobPosting.JobStatus.CLOSED);
        jobRepository.save(job);
    }
}
