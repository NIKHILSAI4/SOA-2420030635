package com.recruitment.matching.client;

import com.recruitment.matching.dto.JobDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "job-service")
public interface JobClient {

    @GetMapping("/api/v1/jobs/{id}")
    JobDto getJobById(@PathVariable("id") UUID id);

    @GetMapping("/api/v1/jobs")
    List<JobDto> getAllJobs();
}
