package com.recruitment.matching.client;

import com.recruitment.matching.dto.CandidateDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "resume-service")
public interface ResumeClient {

    @GetMapping("/api/v1/resumes/profiles")
    List<CandidateDto> getAllProfiles();
}
