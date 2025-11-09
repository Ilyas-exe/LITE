package com.lite.lite_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationDTO {

    private Long id;
    private String company;
    private String wayOfApplying;
    private String contact;
    private String status;
    private LocalDate dateApplied;
    private String jobDescription;
    private String cvUrl;
}
