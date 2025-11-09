package com.lite.lite_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "job_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String company;

    @Column(nullable = true)
    private String wayOfApplying; // e.g., "indeed", "gmail", "linkedin", "company website"

    @Column(nullable = true)
    private String contact; // Contact email or link

    @Column(nullable = false)
    private String status; // e.g., "Submitted", "In Progress", "Rejected", "Awaiting Response"

    @Column(nullable = false)
    private LocalDate dateApplied;

    @Column(length = 1000, nullable = true)
    private String jobDescription; // Job description or notes

    @Column(length = 500)
    private String cvUrl; // URL of uploaded CV (nullable)

    // Relationship: Many JobApplications belong to One User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore // Prevent infinite recursion in JSON
    private User user;
}
