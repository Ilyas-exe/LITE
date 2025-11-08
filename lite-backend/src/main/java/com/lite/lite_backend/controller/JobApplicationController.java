package com.lite.lite_backend.controller;

import com.lite.lite_backend.dto.JobApplicationDTO;
import com.lite.lite_backend.service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    /**
     * GET /api/jobs - Get all job applications for the logged-in user
     */
    @GetMapping
    public ResponseEntity<List<JobApplicationDTO>> getAllJobApplications() {
        try {
            List<JobApplicationDTO> jobs = jobApplicationService.getAllJobApplications();
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/jobs/{id} - Get a single job application by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationDTO> getJobApplicationById(@PathVariable Long id) {
        try {
            JobApplicationDTO job = jobApplicationService.getJobApplicationById(id);
            return ResponseEntity.ok(job);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /api/jobs - Create a new job application
     */
    @PostMapping
    public ResponseEntity<JobApplicationDTO> createJobApplication(@RequestBody JobApplicationDTO dto) {
        try {
            JobApplicationDTO created = jobApplicationService.createJobApplication(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * PUT /api/jobs/{id} - Update an existing job application
     */
    @PutMapping("/{id}")
    public ResponseEntity<JobApplicationDTO> updateJobApplication(
            @PathVariable Long id,
            @RequestBody JobApplicationDTO dto) {
        try {
            JobApplicationDTO updated = jobApplicationService.updateJobApplication(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * DELETE /api/jobs/{id} - Delete a job application
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobApplication(@PathVariable Long id) {
        try {
            jobApplicationService.deleteJobApplication(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /api/jobs/{id}/upload-cv - Upload CV file for a job application
     */
    @PostMapping("/{id}/upload-cv")
    public ResponseEntity<JobApplicationDTO> uploadCV(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            JobApplicationDTO updated = jobApplicationService.uploadCV(id, file);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
