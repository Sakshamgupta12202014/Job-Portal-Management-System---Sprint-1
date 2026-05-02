package com.capg.jobportal.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.capg.jobportal.Exceptions.ForbiddenException;
import com.capg.jobportal.Exceptions.InvalidJobTypeException;
import com.capg.jobportal.Exceptions.ResourceNotFoundException;
import com.capg.jobportal.dto.JobRequestDTO;
import com.capg.jobportal.dto.JobResponseDTO;
import com.capg.jobportal.dto.PagedResponse;
import com.capg.jobportal.entity.Job;
import com.capg.jobportal.enums.JobStatus;
import com.capg.jobportal.enums.JobType;
import com.capg.jobportal.event.JobPostedEvent;
import com.capg.jobportal.repository.JobRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/*
 * ================================================================
 * AUTHOR: Saksham Gupta
 * CLASS: JobService
 * DESCRIPTION:
 * This service contains business logic for job management including
 * job creation, retrieval, search, update, deletion, and admin-level
 * operations. It also handles pagination and filtering.
 * ================================================================
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final RabbitTemplate rabbitTemplate;

    @PersistenceContext
    private EntityManager entityManager;

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key}")
    private String routingKey;

    /* ================================================================
     * METHOD: postJob
     * DESCRIPTION:
     * Allows a recruiter to create and post a new job.
     * ================================================================ */
    @Transactional
    public JobResponseDTO postJob(JobRequestDTO dto, Long postedBy, String userRole) {

        log.info("Recruiter [{}] posting job: {}", postedBy, dto.getTitle());

        if (!"RECRUITER".equals(userRole)) {
            log.warn("Unauthorized role '{}' tried to post job", userRole);
            throw new ForbiddenException("Only recruiters can post jobs");
        }

        Job job = convertToEntity(dto);
        job.setPostedBy(postedBy);
        
        // Use status from DTO if provided (e.g. DRAFT), otherwise default to ACTIVE
        if (dto.getStatus() != null && !dto.getStatus().trim().isEmpty()) {
            try {
                job.setStatus(JobStatus.valueOf(dto.getStatus().toUpperCase().trim()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status provided: {}. Defaulting to ACTIVE", dto.getStatus());
                job.setStatus(JobStatus.ACTIVE);
            }
        } else {
            job.setStatus(JobStatus.ACTIVE);
        }

        Job saved = jobRepository.save(job);
        
        // Only publish event if job is ACTIVE
        if (saved.getStatus() == JobStatus.ACTIVE) {
            publishJobEvent(saved);
        }

        log.info("Job [{}] created successfully with status: {}", saved.getId(), saved.getStatus());

        return convertToResponseDTO(saved);
    }
    
    private void publishJobEvent(Job job) {
        JobPostedEvent event = new JobPostedEvent(
                job.getId(),
                job.getTitle(),
                job.getCompanyName(),
                job.getLocation(),
                job.getJobType().name(),
                job.getSalary(),
                job.getExperienceYears(),
                job.getDescription()
        );
        rabbitTemplate.convertAndSend(exchange, routingKey, event);
    }
    

    /* ================================================================
     * METHOD: getAllJobs
     * DESCRIPTION:
     * Retrieves all active and closed jobs for public view (hides DRAFT).
     * ================================================================ */
    public PagedResponse<JobResponseDTO> getAllJobs(int page, int size) {

        log.debug("Fetching public jobs — page: {}, size: {}", page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        // Publicly visible jobs: ACTIVE and CLOSED (DRAFT and DELETED are hidden)
        Page<Job> jobPage = jobRepository.findByStatusIn(
                Arrays.asList(JobStatus.ACTIVE, JobStatus.CLOSED), pageable);

        log.info("Fetched {} public jobs", jobPage.getNumberOfElements());

        return buildPagedResponse(jobPage);
    }

    
    /* ================================================================
     * METHOD: getJobById
     * DESCRIPTION:
     * Fetches job details. Public can only see ACTIVE/CLOSED. 
     * Owner recruiter can see DRAFT.
     * ================================================================ */
    public JobResponseDTO getJobById(Long id, Long currentUserId, String currentUserRole) {

        log.debug("Fetching job [{}]", id);

        Job job = jobRepository.findByIdAndStatusNot(id, JobStatus.DELETED)
                .orElseThrow(() -> {
                    log.warn("Job [{}] not found", id);
                    return new ResourceNotFoundException("Job not found with id: " + id);
                });

        // Visibility Rule for DRAFT: Only the owner recruiter can see it
        if (job.getStatus() == JobStatus.DRAFT) {
            if (currentUserId == null || !job.getPostedBy().equals(currentUserId)) {
                log.warn("User [{}] attempted to view DRAFT job [{}]", currentUserId, id);
                throw new ResourceNotFoundException("Job not found");
            }
        }

        return convertToResponseDTO(job);
    }
    
    // Legacy overload for backward compatibility if needed (defaults to public access)
    public JobResponseDTO getJobById(Long id) {
        return getJobById(id, null, null);
    }

    
    /* ================================================================
     * METHOD: searchJobs
     * DESCRIPTION:
     * Searches jobs. Native query already filters for ACTIVE only.
     * ================================================================ */
    public PagedResponse<JobResponseDTO> searchJobs(String title, String location,
                                                    String jobType, Integer experienceYears,
                                                    int page, int size) {

        log.info("Searching jobs — title: {}, location: {}", title, location);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        JobType jobTypeEnum = null;

        if (jobType != null && !jobType.isEmpty()) {
            try {
                jobTypeEnum = JobType.valueOf(jobType.toUpperCase());
            } catch (Exception e) {
                log.warn("Invalid job type: {}", jobType);
                throw new InvalidJobTypeException("Invalid job type: " + jobType);
            }
        }

        Page<Job> jobPage = jobRepository.searchJobs(
                title, location, jobTypeEnum, experienceYears, pageable);

        log.info("Search returned {} results", jobPage.getTotalElements());

        return buildPagedResponse(jobPage);
    }

    
    /* ================================================================
     * METHOD: updateJob
     * DESCRIPTION:
     * Updates job details if the requester is the owner recruiter.
     * ================================================================ */
    @Transactional
    public JobResponseDTO updateJob(Long id, JobRequestDTO dto,
                                   Long currentUserId, String currentUserRole) {

        log.info("SUPER-DEBUG: Updating job [{}] with status: {}", id, dto.getStatus());

        if (!currentUserRole.equals("RECRUITER")) {
            throw new ForbiddenException("Only recruiters can update jobs");
        }

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getPostedBy().equals(currentUserId)) {
            throw new ForbiddenException("Not your job");
        }

        // Capture previous status to detect publishing
        JobStatus oldStatus = job.getStatus();

        // Use native query first to be 100% sure the DB record is updated
        if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {
            String newStatusStr = dto.getStatus().toUpperCase().trim();
            log.info("SUPER-DEBUG: Executing native update for job [{}] to {}", id, newStatusStr);
            jobRepository.updateJobStatus(id, newStatusStr);
            // Force flush and clear to ensure Hibernate reloads from DB
            entityManager.flush();
            entityManager.clear();
        }

        // Now find the job (it will be re-fetched from DB due to clear())
        Job reFetchedJob = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found after update"));

        // Update other fields on the managed entity
        reFetchedJob.setTitle(dto.getTitle());
        reFetchedJob.setCompanyName(dto.getCompanyName());
        reFetchedJob.setLocation(dto.getLocation());
        reFetchedJob.setSalary(dto.getSalary());
        reFetchedJob.setExperienceYears(dto.getExperienceYears());
        
        if (dto.getJobType() != null) {
            reFetchedJob.setJobType(JobType.valueOf(dto.getJobType().toUpperCase().trim()));
        }
        
        reFetchedJob.setSkillsRequired(dto.getSkillsRequired());
        reFetchedJob.setDescription(dto.getDescription());
        reFetchedJob.setDeadline(dto.getDeadline());
        
        // Final save for non-status fields
        Job saved = jobRepository.saveAndFlush(reFetchedJob);

        // If transitioning from DRAFT to ACTIVE, publish the event
        if (oldStatus == JobStatus.DRAFT && saved.getStatus() == JobStatus.ACTIVE) {
            log.info("Job [{}] published! Sending notification event.", id);
            publishJobEvent(saved);
        }

        log.info("SUPER-DEBUG: Update complete. Final status: {}", saved.getStatus());

        return convertToResponseDTO(saved);
    }
    

    /* ================================================================
     * METHOD: deleteJob
     * DESCRIPTION:
     * Performs soft delete of job if requester is owner recruiter.
     * ================================================================ */
    @Transactional
    public void deleteJob(Long id, Long userId, String role) {

        log.info("Deleting job [{}] by user [{}]", id, userId);

        if (!role.equals("RECRUITER")) {
            throw new ForbiddenException("Only recruiters can delete jobs");
        }

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getPostedBy().equals(userId)) {
            throw new ForbiddenException("Not your job");
        }

        job.setStatus(JobStatus.DELETED);
        jobRepository.save(job);

        log.info("Job [{}] soft deleted", id);
    }

    
    /* ================================================================
     * METHOD: getMyJobs
     * DESCRIPTION:
     * Retrieves jobs posted by a recruiter with pagination.
     * ================================================================ */
    public PagedResponse<JobResponseDTO> getMyJobs(Long userId, String role, int page, int size) {

        log.info("Fetching jobs for recruiter [{}]", userId);

        if (!role.equals("RECRUITER")) {
            throw new ForbiddenException("Access denied");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        // Recruiter sees their own jobs (ACTIVE, CLOSED, DRAFT) but not DELETED
        Page<Job> jobPage =
                jobRepository.findByPostedByAndStatusNot(userId, JobStatus.DELETED, pageable);

        return buildPagedResponse(jobPage);
    }

    
    /* ================================================================
     * METHOD: getAllJobsForAdmin (Paginated)
     * DESCRIPTION:
     * Retrieves all jobs with optional company name filtering and pagination.
     * ================================================================ */
    public PagedResponse<JobResponseDTO> getAllJobsForAdmin(int page, int size, String companyName) {
        log.info("Admin fetching paginated jobs [company={}] — page: {}, size: {}", 
            companyName, page, size);
            
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        // Use the new repository method that handles optional filtering
        Page<Job> jobPage = jobRepository.findAllForAdmin(companyName, pageable);
        
        return buildPagedResponse(jobPage);
    }

    public List<JobResponseDTO> getAllJobsForAdmin() {
        log.info("Admin fetching all jobs");
        List<Job> jobs = jobRepository.findAll();
        List<JobResponseDTO> result = new ArrayList<>();
        for (Job job : jobs) {
            result.add(convertToResponseDTO(job));
        }
        return result;
    }

    
    /* ================================================================
     * METHOD: deleteJobByAdmin
     * DESCRIPTION:
     * Allows admin to soft delete any job without ownership check.
     * ================================================================ */
    @Transactional
    public void deleteJobByAdmin(Long id) {

        log.info("Admin deleting job [{}]", id);

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        job.setStatus(JobStatus.DELETED);
        jobRepository.save(job);
    }
    

    /* ================================================================
     * PRIVATE HELPER METHODS
     * ================================================================ */

    private PagedResponse<JobResponseDTO> buildPagedResponse(Page<Job> jobPage) {
        return new PagedResponse<>(
                jobPage.getContent().stream().map(this::convertToResponseDTO).toList(),
                jobPage.getNumber(),
                jobPage.getTotalPages(),
                jobPage.getTotalElements(),
                jobPage.isLast()
        );
    }

    private Job convertToEntity(JobRequestDTO dto) {
        Job job = new Job();
        job.setTitle(dto.getTitle());
        job.setCompanyName(dto.getCompanyName());
        job.setLocation(dto.getLocation());
        job.setSalary(dto.getSalary());
        job.setExperienceYears(dto.getExperienceYears());
        
        if (dto.getJobType() != null && !dto.getJobType().trim().isEmpty()) {
            try {
                job.setJobType(JobType.valueOf(dto.getJobType().toUpperCase().trim()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid job type provided: {}. Defaulting to FULL_TIME", dto.getJobType());
                job.setJobType(JobType.FULL_TIME);
            }
        }
        
        job.setSkillsRequired(dto.getSkillsRequired());
        job.setDescription(dto.getDescription());
        job.setDeadline(dto.getDeadline());
        return job;
    }

    private JobResponseDTO convertToResponseDTO(Job job) {
        JobResponseDTO dto = new JobResponseDTO();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setCompanyName(job.getCompanyName());
        dto.setLocation(job.getLocation());
        dto.setSalary(job.getSalary());
        dto.setExperienceYears(job.getExperienceYears());
        dto.setJobType(job.getJobType().name());
        dto.setSkillsRequired(job.getSkillsRequired());
        dto.setDescription(job.getDescription());
        dto.setStatus(job.getStatus().name());
        dto.setDeadline(job.getDeadline());
        dto.setPostedBy(job.getPostedBy());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setUpdatedAt(job.getUpdatedAt());
        return dto;
    }
}