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
public class RecruiterApplicationResponse {

    private Long id;
    private Long userId;
    private Long jobId;
    private String resumeUrl;
    private String coverLetter;
    private ApplicationStatus status;
    private String recruiterNote;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    
    // Candidate Details
    private String candidateName;
    private String candidateEmail;
    private String candidateBio;
    private String candidateLocation;
    private Integer candidateExperience;
    private String candidateSkills;

    // Job Details
    private String jobTitle;

    public static RecruiterApplicationResponse fromEntity(Application application) {
        RecruiterApplicationResponse response = new RecruiterApplicationResponse();
        response.id = application.getId();
        response.userId = application.getUserId();
        response.jobId = application.getJobId();
        response.resumeUrl = application.getResumeUrl();
        response.coverLetter = application.getCoverLetter();
        response.status = application.getStatus();
        response.recruiterNote = application.getRecruiterNote();
        response.appliedAt = application.getAppliedAt();
        response.updatedAt = application.getUpdatedAt();
        return response;
    }
}