package com.recruitment.resume.service;

import com.recruitment.resume.dto.CandidateProfileDto;
import com.recruitment.resume.dto.NlpExtractResponse;
import com.recruitment.resume.model.ExtractedSkill;
import com.recruitment.resume.model.Resume;
import com.recruitment.resume.repository.ResumeRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    private static final Logger log = LoggerFactory.getLogger(ResumeService.class);

    private final ResumeRepository resumeRepository;
    private final RestTemplate restTemplate;

    @Value("${upload.dir:/tmp/recruitment/resumes}")
    private String uploadDir;

    @Value("${nlp.service.url:http://localhost:8000}")
    private String nlpServiceUrl;

    public ResumeService(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
        this.restTemplate = new RestTemplate();
    }

    @Transactional
    public Resume uploadResume(UUID candidateId, MultipartFile file) throws Exception {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume.pdf";
        String storedFilename = candidateId + "_" + UUID.randomUUID() + "_" + originalFilename;
        Path targetLocation = uploadPath.resolve(storedFilename);

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        Resume resume = new Resume();
        resume.setCandidateId(candidateId);
        resume.setOriginalFilename(originalFilename);
        resume.setFilePath(targetLocation.toString());
        resume.setFileSize(file.getSize());
        resume.setContentType(file.getContentType());
        resume.setStatus(Resume.ResumeStatus.UPLOADED);

        Resume saved = resumeRepository.save(resume);

        // Process extraction in background or immediate thread
        processExtractionAsync(saved.getId(), targetLocation, file.getContentType());

        return saved;
    }

    private void processExtractionAsync(UUID resumeId, Path filePath, String contentType) {
        new Thread(() -> {
            try {
                Resume r = resumeRepository.findById(resumeId).orElse(null);
                if (r == null) return;

                r.setStatus(Resume.ResumeStatus.EXTRACTING);
                resumeRepository.save(r);

                String text = "";
                if (contentType != null && contentType.contains("pdf")) {
                    try (PDDocument document = PDDocument.load(filePath.toFile())) {
                        PDFTextStripper stripper = new PDFTextStripper();
                        text = stripper.getText(document);
                    }
                } else {
                    text = Files.readString(filePath, StandardCharsets.UTF_8);
                }

                r.setExtractedText(text);

                // Call NLP Service
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                Map<String, String> body = Map.of("text", text);
                HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

                NlpExtractResponse nlpResp = restTemplate.postForObject(
                        nlpServiceUrl + "/nlp/extract",
                        request,
                        NlpExtractResponse.class
                );

                if (nlpResp != null) {
                    r.setExperienceYears(nlpResp.getExperienceYears() != null ? nlpResp.getExperienceYears() : 0.0);
                    if (nlpResp.getSkills() != null) {
                        for (String skill : nlpResp.getSkills()) {
                            r.addSkill(new ExtractedSkill(skill, "EXTRACTED"));
                        }
                    }
                }

                r.setStatus(Resume.ResumeStatus.PARSED);
                r.setParsedAt(LocalDateTime.now());
                resumeRepository.save(r);

            } catch (Exception e) {
                log.error("Failed to parse resume: " + resumeId, e);
                Resume r = resumeRepository.findById(resumeId).orElse(null);
                if (r != null) {
                    r.setStatus(Resume.ResumeStatus.FAILED);
                    r.setErrorMessage(e.getMessage());
                    resumeRepository.save(r);
                }
            }
        }).start();
    }

    public Resume getLatestResume(UUID candidateId) {
        return resumeRepository.findFirstByCandidateIdOrderByCreatedAtDesc(candidateId)
                .orElseThrow(() -> new IllegalArgumentException("No resume found for candidate: " + candidateId));
    }

    public Resume getResumeById(UUID id) {
        return resumeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resume not found with id: " + id));
    }

    public List<CandidateProfileDto> getAllParsedProfiles() {
        List<Resume> parsed = resumeRepository.findByStatus(Resume.ResumeStatus.PARSED);
        return parsed.stream().map(r -> new CandidateProfileDto(
                r.getId(),
                r.getCandidateId(),
                r.getOriginalFilename(),
                r.getExperienceYears(),
                r.getExtractedSkills().stream().map(ExtractedSkill::getSkillName).collect(Collectors.toList()),
                r.getStatus().name()
        )).collect(Collectors.toList());
    }
}
