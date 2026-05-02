package com.capg.jobportal.service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.capg.jobportal.client.AuthServiceClient;
import com.capg.jobportal.client.JobServiceClient;
import com.capg.jobportal.dao.ApplicationRepository;
import com.capg.jobportal.dto.ApplicationResponse;
import com.capg.jobportal.dto.ApplicationStats;
import com.capg.jobportal.dto.JobClientResponse;
import com.capg.jobportal.dto.PagedResponse;
import com.capg.jobportal.dto.RecruiterApplicationResponse;
import com.capg.jobportal.dto.StatusUpdateRequest;
import com.capg.jobportal.dto.UserInfoResponse;
import com.capg.jobportal.entity.Application;
import com.capg.jobportal.enums.ApplicationStatus;
import com.capg.jobportal.event.JobAppliedEvent;
import com.capg.jobportal.exception.DuplicateApplicationException;
import com.capg.jobportal.exception.ForbiddenException;
import com.capg.jobportal.exception.InvalidStatusTransitionException;
import com.capg.jobportal.exception.ResourceNotFoundException;
import com.capg.jobportal.util.CloudinaryUtil;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/*
 * ================================================================
 * AUTHOR: Saksham Gupta
 * CLASS: ApplicationService
 * DESCRIPTION:
 * This service handles all business logic related to job applications
 * including applying for jobs, retrieving applications, managing
 * application status, validating transitions, and generating
 * application statistics.
 * ================================================================
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobServiceClient jobServiceClient;
    private final CloudinaryUtil cloudinaryUtil;
    private final RabbitTemplate rabbitTemplate;
    private final AuthServiceClient authServiceClient;

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key}")
    private String routingKey;

    /* ================================================================
     * METHOD: applyForJob
     * DESCRIPTION:
     * Allows a job seeker to apply for a job after validating job status,
     * deadline, and duplicate applications. Handles resume upload logic.
     * ================================================================ */
    @CircuitBreaker(name = "jobServiceCB", fallbackMethod = "applyForJobFallback")
    public ApplicationResponse applyForJob(Long jobId, String coverLetter,
                                           boolean useExistingResume, String existingResumeUrl,
                                           MultipartFile resumeFile, Long seekerId) throws IOException {

        log.info("User [{}] applying for job [{}]", seekerId, jobId);

        JobClientResponse job =
                jobServiceClient.getJobById(jobId, String.valueOf(seekerId), "JOB_SEEKER");

        if (job == null) {
            log.warn("Job [{}] not found", jobId);
            throw new ResourceNotFoundException("Job not found with id: " + jobId);
        }

        // Validate Job Status
        if ("DELETED".equalsIgnoreCase(job.getStatus())) {
            throw new ResourceNotFoundException("Job not found");
        }

        if (!"ACTIVE".equalsIgnoreCase(job.getStatus())) {
            log.warn("Job [{}] is {} — applications are not allowed", jobId, job.getStatus());
            throw new IllegalArgumentException("This job is no longer accepting applications (Status: " + job.getStatus() + ")");
        }

        // Validate Deadline
        if (job.getDeadline() != null && job.getDeadline().isBefore(LocalDate.now())) {
            log.warn("Deadline passed for job [{}]: {}", jobId, job.getDeadline());
            throw new IllegalArgumentException("Application deadline has passed");
        }

        // Check for duplicate application
        if (applicationRepository.existsByUserIdAndJobId(seekerId, jobId)) {
            log.warn("Duplicate application — user [{}] already applied for job [{}]", seekerId, jobId);
            throw new DuplicateApplicationException("Already applied");
        }

        String resumeUrl;

        if (useExistingResume) {
            if (existingResumeUrl == null || existingResumeUrl.isEmpty()) {
                log.warn("User [{}] selected existing resume but no URL provided", seekerId);
                throw new IllegalArgumentException("No saved resume found");
            }
            resumeUrl = existingResumeUrl;
        } else {
            if (resumeFile == null || resumeFile.isEmpty()) {
                log.warn("User [{}] did not upload resume", seekerId);
                throw new IllegalArgumentException("Resume required");
            }
            resumeUrl = cloudinaryUtil.uploadResume(resumeFile);
            log.debug("Resume uploaded for user [{}]: {}", seekerId, resumeUrl);
        }

        Application application = new Application();
        application.setUserId(seekerId);
        application.setJobId(jobId);
        application.setResumeUrl(resumeUrl);
        application.setCoverLetter(coverLetter);
        application.setStatus(ApplicationStatus.APPLIED);

        Application saved = applicationRepository.save(application);
        
      // Publish event to RabbitMQ after saving
        try {
            UserInfoResponse seeker = authServiceClient.getUserInfo(seekerId);

            JobAppliedEvent event = new JobAppliedEvent();
            event.setJobId(jobId);
            event.setJobTitle(job.getTitle());
            event.setSeekerId(seekerId);
            event.setSeekerName(seeker.getName());
            event.setSeekerEmail(seeker.getEmail());
            event.setRecruiterId(job.getPostedBy());

            rabbitTemplate.convertAndSend(exchange, routingKey, event);
        } catch (Exception e) {
            // Don't fail the application if notification fails
            System.err.println("Failed to publish job applied event: " + e.getMessage());
        }

        log.info("Application [{}] created successfully", saved.getId());

        ApplicationResponse responseDTO = ApplicationResponse.fromEntity(saved);
        responseDTO.setJobTitle(job.getTitle());
        responseDTO.setCompanyName(job.getCompanyName());
        responseDTO.setLocation(job.getLocation());
        responseDTO.setSalary(job.getSalary());
        responseDTO.setExperienceYears(job.getExperienceYears());
        
        return responseDTO;
    }

    public ApplicationResponse applyForJobFallback(Long jobId, String coverLetter,
                                                   boolean useExistingResume, String existingResumeUrl,
                                                   MultipartFile resumeFile, Long seekerId, Exception e) {
        log.error("Fallback for applyForJob: {}", e.getMessage());
        throw new ForbiddenException("Job Service is currently unavailable. Please try again later.");
    }

    
    /* ================================================================
     * METHOD: getMyApplications
     * DESCRIPTION:
     * Retrieves all applications submitted by a specific job seeker.
     * ================================================================ */
    public List<ApplicationResponse> getMyApplications(Long seekerId) {

        log.debug("Fetching applications for user [{}]", seekerId);

        List<Application> list = applicationRepository.findByUserId(seekerId);

        List<ApplicationResponse> response = new ArrayList<>();
        for (Application app : list) {
            response.add(fetchApplicationWithJobDetails(app, seekerId));
        }

        log.info("Returned {} applications", response.size());

        return response;
    }

    @CircuitBreaker(name = "jobServiceCB", fallbackMethod = "fetchJobDetailsFallback")
    private ApplicationResponse fetchApplicationWithJobDetails(Application app, Long userId) {
        ApplicationResponse res = ApplicationResponse.fromEntity(app);
        JobClientResponse job = jobServiceClient.getJobById(app.getJobId(), String.valueOf(userId), "JOB_SEEKER");
        if (job != null) {
            res.setJobTitle(job.getTitle());
            res.setCompanyName(job.getCompanyName());
            res.setLocation(job.getLocation());
            res.setSalary(job.getSalary());
            res.setExperienceYears(job.getExperienceYears());
        }
        return res;
    }

    public ApplicationResponse fetchJobDetailsFallback(Application app, Long userId, Exception e) {
        log.warn("Fallback triggered for job details enrichment: {}", e.getMessage());
        ApplicationResponse res = ApplicationResponse.fromEntity(app);
        res.setJobTitle("Job Details Unavailable");
        res.setCompanyName("Service Down");
        return res;
    }

    
    /* ================================================================
     * METHOD: getApplicationById
     * DESCRIPTION:
     * Retrieves a specific application ensuring it belongs to the user.
     * ================================================================ */
    public ApplicationResponse getApplicationById(Long id, Long seekerId) {

        log.debug("Fetching application [{}] for user [{}]", id, seekerId);

        Optional<Application> optional =
                applicationRepository.findByIdAndUserId(id, seekerId);

        if (optional.isEmpty()) {
            log.warn("Application [{}] not accessible", id);
            throw new ForbiddenException("Not allowed");
        }

        return fetchApplicationWithJobDetails(optional.get(), seekerId);
    }

    
    /* ================================================================
     * METHOD: getApplicantsForJob
     * DESCRIPTION:
     * Retrieves all applicants for a job ensuring recruiter ownership.
     * Enriches applicants with candidate profile details.
     * ================================================================ */
    @CircuitBreaker(name = "jobServiceCB", fallbackMethod = "getApplicantsFallback")
    public List<RecruiterApplicationResponse> getApplicantsForJob(Long jobId, Long recruiterId) {

        log.debug("Fetching applicants for job [{}]", jobId);

        JobClientResponse job =
                jobServiceClient.getJobById(jobId, String.valueOf(recruiterId), "RECRUITER");

        if (job == null) {
            throw new ResourceNotFoundException("Job not found");
        }

        if (!job.getPostedBy().equals(recruiterId)) {
            throw new ForbiddenException("Not allowed");
        }

        List<Application> list = applicationRepository.findByJobId(jobId);

        List<RecruiterApplicationResponse> response = new ArrayList<>();
        for (Application app : list) {
            response.add(enrichWithCandidateDetails(app, job.getTitle()));
        }

        return response;
    }

    public List<RecruiterApplicationResponse> getApplicantsFallback(Long jobId, Long recruiterId, Exception e) {
        log.error("Fallback for getApplicantsForJob: {}", e.getMessage());
        throw new ForbiddenException("Service is currently unavailable. Recruiter validation failed.");
    }

    @CircuitBreaker(name = "authServiceCB", fallbackMethod = "enrichCandidateFallback")
    private RecruiterApplicationResponse enrichWithCandidateDetails(Application app, String jobTitle) {
        RecruiterApplicationResponse res = RecruiterApplicationResponse.fromEntity(app);
        UserInfoResponse user = authServiceClient.getUserInfo(app.getUserId());
        if (user != null) {
            res.setCandidateName(user.getName());
            res.setCandidateBio(user.getBio());
            res.setCandidateLocation(user.getLocation());
            res.setCandidateExperience(user.getExperienceYears());
            res.setCandidateSkills(user.getSkills());
            res.setCandidateEmail(user.getEmail());
        }
        res.setJobTitle(jobTitle);
        return res;
    }

    public RecruiterApplicationResponse enrichCandidateFallback(Application app, String jobTitle, Exception e) {
        log.warn("Fallback triggered for candidate enrichment: {}", e.getMessage());
        RecruiterApplicationResponse res = RecruiterApplicationResponse.fromEntity(app);
        res.setCandidateName("Candidate Info Unavailable");
        res.setJobTitle(jobTitle);
        return res;
    }

    /* ================================================================
     * METHOD: getAllApplicationsForRecruiter
     * DESCRIPTION:
     * Retrieves all applications for all jobs posted by the recruiter.
     * ================================================================ */
    @CircuitBreaker(name = "jobServiceCB", fallbackMethod = "getRecruiterAppsFallback")
    public List<RecruiterApplicationResponse> getAllApplicationsForRecruiter(Long recruiterId) {
        log.info("Fetching all applications for recruiter [{}]", recruiterId);

        PagedResponse<JobClientResponse> pagedJobs = 
            jobServiceClient.getMyJobs(String.valueOf(recruiterId), "RECRUITER", 0, 1000);
        
        List<JobClientResponse> recruiterJobs = pagedJobs.getContent();
        if (recruiterJobs.isEmpty()) return new ArrayList<>();

        List<Long> jobIds = recruiterJobs.stream()
                .map(JobClientResponse::getId)
                .collect(Collectors.toList());

        List<Application> applications = applicationRepository.findByJobIdIn(jobIds);

        List<RecruiterApplicationResponse> response = new ArrayList<>();
        for (Application app : applications) {
            String jobTitle = recruiterJobs.stream()
                .filter(j -> j.getId().equals(app.getJobId()))
                .findFirst()
                .map(JobClientResponse::getTitle)
                .orElse("Unknown Job");
                
            response.add(enrichWithCandidateDetails(app, jobTitle));
        }

        return response;
    }

    public List<RecruiterApplicationResponse> getRecruiterAppsFallback(Long recruiterId, Exception e) {
        log.error("Fallback for getAllApplicationsForRecruiter: {}", e.getMessage());
        throw new ForbiddenException("Could not fetch recruiter job list. Service unavailable.");
    }
    

    /* ================================================================
     * METHOD: updateApplicationStatus
     * DESCRIPTION:
     * Updates the status of an application with proper validation
     * and recruiter authorization.
     * ================================================================ */
    @CircuitBreaker(name = "jobServiceCB", fallbackMethod = "updateStatusFallback")
    public ApplicationResponse updateApplicationStatus(Long id,
                                                       StatusUpdateRequest request,
                                                       Long recruiterId) {

        log.info("Updating application [{}] status", id);

        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        JobClientResponse job = jobServiceClient.getJobById(
                app.getJobId(), String.valueOf(recruiterId), "RECRUITER");

        if (job == null || !job.getPostedBy().equals(recruiterId)) {
            throw new ForbiddenException("Not allowed");
        }

        validateStatusTransition(app.getStatus(), request.getNewStatus());

        app.setStatus(request.getNewStatus());

        if (request.getRecruiterNote() != null) {
            app.setRecruiterNote(request.getRecruiterNote());
        }

        Application updated = applicationRepository.save(app);

        return ApplicationResponse.fromEntity(updated);
    }

    public ApplicationResponse updateStatusFallback(Long id, StatusUpdateRequest request, Long recruiterId, Exception e) {
        log.error("Fallback for updateApplicationStatus: {}", e.getMessage());
        throw new ForbiddenException("Status update failed. Service is currently unavailable.");
    }

    
    /* ================================================================
     * METHOD: validateStatusTransition
     * DESCRIPTION:
     * Ensures only valid transitions between application statuses.
     * ================================================================ */
    private void validateStatusTransition(ApplicationStatus current, ApplicationStatus next) {

        if (current == ApplicationStatus.REJECTED) {
            throw new InvalidStatusTransitionException("Already rejected");
        }

        boolean valid =
                (current == ApplicationStatus.APPLIED && next == ApplicationStatus.UNDER_REVIEW) ||
                (current == ApplicationStatus.UNDER_REVIEW &&
                        (next == ApplicationStatus.SHORTLISTED || next == ApplicationStatus.REJECTED)) ||
                (current == ApplicationStatus.SHORTLISTED && next == ApplicationStatus.REJECTED);

        if (!valid) {
            throw new InvalidStatusTransitionException("Invalid transition");
        }
    }

    
    /* ================================================================
     * METHOD: getApplicationStats
     * DESCRIPTION:
     * Calculates application statistics including total and
     * status-wise counts.
     * ================================================================ */
    public ApplicationStats getApplicationStats() {

        List<Application> all = applicationRepository.findAll();

        long applied = 0, review = 0, shortlisted = 0, rejected = 0;

        for (Application app : all) {
            switch (app.getStatus()) {
                case APPLIED -> applied++;
                case UNDER_REVIEW -> review++;
                case SHORTLISTED -> shortlisted++;
                case REJECTED -> rejected++;
            }
        }

        ApplicationStats stats = new ApplicationStats();
        stats.setTotalApplications(all.size());
        stats.setAppliedCount(applied);
        stats.setUnderReviewCount(review);
        stats.setShortlistedCount(shortlisted);
        stats.setRejectedCount(rejected);

        log.info("Application stats calculated");

        return stats;
    }
}