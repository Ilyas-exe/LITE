package com.lite.lite_backend.service;

import com.lite.lite_backend.dto.JobApplicationDTO;
import com.lite.lite_backend.entity.JobApplication;
import com.lite.lite_backend.entity.User;
import com.lite.lite_backend.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final CloudinaryService cloudinaryService;

    /**
     * Get the currently logged-in user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    /**
     * Convert JobApplication entity to DTO
     */
    private JobApplicationDTO convertToDTO(JobApplication jobApplication) {
        return new JobApplicationDTO(
                jobApplication.getId(),
                jobApplication.getCompany(),
                jobApplication.getRole(),
                jobApplication.getStatus(),
                jobApplication.getDateApplied(),
                jobApplication.getCvUrl());
    }

    /**
     * Get all job applications for the logged-in user
     */
    public List<JobApplicationDTO> getAllJobApplications() {
        User currentUser = getCurrentUser();
        List<JobApplication> jobApplications = jobApplicationRepository.findByUserOrderByDateAppliedDesc(currentUser);
        return jobApplications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a single job application by ID (only if it belongs to the current user)
     */
    public JobApplicationDTO getJobApplicationById(Long id) {
        User currentUser = getCurrentUser();
        JobApplication jobApplication = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job application not found"));

        // Security check: ensure the job application belongs to the current user
        if (!jobApplication.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        return convertToDTO(jobApplication);
    }

    /**
     * Create a new job application
     */
    public JobApplicationDTO createJobApplication(JobApplicationDTO dto) {
        User currentUser = getCurrentUser();

        JobApplication jobApplication = new JobApplication();
        jobApplication.setCompany(dto.getCompany());
        jobApplication.setRole(dto.getRole());
        jobApplication.setStatus(dto.getStatus());
        jobApplication.setDateApplied(dto.getDateApplied());
        jobApplication.setUser(currentUser);

        JobApplication saved = jobApplicationRepository.save(jobApplication);
        return convertToDTO(saved);
    }

    /**
     * Update an existing job application
     */
    public JobApplicationDTO updateJobApplication(Long id, JobApplicationDTO dto) {
        User currentUser = getCurrentUser();
        JobApplication jobApplication = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job application not found"));

        // Security check
        if (!jobApplication.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        jobApplication.setCompany(dto.getCompany());
        jobApplication.setRole(dto.getRole());
        jobApplication.setStatus(dto.getStatus());
        jobApplication.setDateApplied(dto.getDateApplied());

        JobApplication updated = jobApplicationRepository.save(jobApplication);
        return convertToDTO(updated);
    }

    /**
     * Delete a job application
     */
    public void deleteJobApplication(Long id) {
        User currentUser = getCurrentUser();
        JobApplication jobApplication = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job application not found"));

        // Security check
        if (!jobApplication.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        jobApplicationRepository.delete(jobApplication);
    }

    /**
     * Upload CV for a job application
     */
    public JobApplicationDTO uploadCV(Long id, MultipartFile file) throws IOException {
        User currentUser = getCurrentUser();
        JobApplication jobApplication = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job application not found"));

        // Security check
        if (!jobApplication.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        // Upload file to Cloudinary
        String cvUrl = cloudinaryService.uploadFile(file);

        // Update job application with CV URL
        jobApplication.setCvUrl(cvUrl);
        JobApplication updated = jobApplicationRepository.save(jobApplication);

        return convertToDTO(updated);
    }
}
