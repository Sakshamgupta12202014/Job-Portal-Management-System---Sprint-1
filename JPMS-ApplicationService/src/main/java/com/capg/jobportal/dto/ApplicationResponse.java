package com.capg.jobportal.dto;

import java.time.LocalDateTime;

import com.capg.jobportal.entity.Application;
import com.capg.jobportal.enums.ApplicationStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {

	private Long id;
    private Long userId;
    private Long jobId;
    private String resumeUrl;
    private String coverLetter;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    
    // Additional fields for job details
    private String jobTitle;
    private String companyName;
    private String location;
    private Double salary;
    private Integer experienceYears;
 
    public static ApplicationResponse fromEntity(Application application) {
        ApplicationResponse response = new ApplicationResponse();
        response.id = application.getId();
        response.userId = application.getUserId();
        response.jobId = application.getJobId();
        response.resumeUrl = application.getResumeUrl();
        response.coverLetter = application.getCoverLetter();
        response.status = application.getStatus();
        response.appliedAt = application.getAppliedAt();
        response.updatedAt = application.getUpdatedAt();
        return response;
    }
}
