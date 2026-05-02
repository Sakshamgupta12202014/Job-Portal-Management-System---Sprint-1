package com.capg.jobportal.service;

import org.springframework.stereotype.Service;

import com.capg.jobportal.client.AdminAppClient;
import com.capg.jobportal.client.AdminJobClient;
import com.capg.jobportal.client.AuthServiceClient;
import com.capg.jobportal.dto.*;
import com.capg.jobportal.model.AuditLog;
import com.capg.jobportal.repository.AuditLogRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/*
 * ================================================================
 * AUTHOR: Saksham Gupta
 * CLASS: AdminService
 * DESCRIPTION:
 * This service handles all admin-related business logic including
 * user management, job management, platform reporting, and audit
 * logging. It interacts with multiple microservices via clients
 * and ensures proper tracking of admin actions.
 * ================================================================
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AdminService {

    private final AuthServiceClient authServiceClient;
    private final AdminJobClient adminJobClient;
    private final AdminAppClient adminAppClient;
    private final AuditLogRepository auditLogRepository;

    /* ================================================================
     * METHOD: getAllUsers
     * DESCRIPTION:
     * Retrieves all users from AuthService for admin monitoring.
     * ================================================================ */
    public List<UserResponse> getAllUsers() {
        log.debug("Fetching users from AuthService");
        List<UserResponse> users = authServiceClient.getAllUsers();
        log.info("Total users fetched: {}", users.size());
        return users;
    }

    public PagedResponse<UserResponse> getAllUsersPaged(int page, int size) {
        log.info("Fetching paginated users from AuthService — page: {}, size: {}", page, size);
        return authServiceClient.getAllUsersPaged(page, size);
    }

    
    /* ================================================================
     * METHOD: deleteUser
     * DESCRIPTION:
     * Deletes a user by ID and records the action in audit logs.
     * ================================================================ */
    public void deleteUser(Long id, Long adminId) {

        log.info("Admin [{}] deleting user [{}]", adminId, id);

        authServiceClient.deleteUser(id);

        AuditLog auditLog = new AuditLog("DELETE_USER", "admin:" + adminId, "Deleted user ID: " + id);
        auditLogRepository.save(auditLog);

        log.info("User [{}] deleted and audit log saved", id);
    }

    
    /* ================================================================
     * METHOD: banUser
     * DESCRIPTION:
     * Bans a user, invalidates their session, and records the action.
     * ================================================================ */
    public void banUser(Long id, Long adminId) {

        log.info("Admin [{}] banning user [{}]", adminId, id);

        // Prevent admin from banning themselves
        if (id.equals(adminId)) {
            log.warn("Admin [{}] tried to ban themselves", adminId);
            throw new IllegalArgumentException("Admin cannot ban themselves");
        }

        authServiceClient.banUser(id);

        /*
         * Attempt to invalidate user token.
         * If it fails, log warning but continue execution.
         */
        try {
            authServiceClient.invalidateToken(id);
            log.debug("Token invalidated for user [{}]", id);
        } catch (Exception e) {
            log.warn("Token invalidation failed for user [{}]: {}", id, e.getMessage());
        }

        AuditLog auditLog = new AuditLog("BAN_USER", "admin:" + adminId, "Banned user ID: " + id);
        auditLogRepository.save(auditLog);

        log.info("User [{}] banned and audit log saved", id);
    }

    
    /* ================================================================
     * METHOD: unbanUser
     * DESCRIPTION:
     * Restores access for a banned user and logs the action.
     * ================================================================ */
    public void unbanUser(Long id, Long adminId) {

        log.info("Admin [{}] unbanning user [{}]", adminId, id);

        authServiceClient.unbanUser(id);

        AuditLog auditLog = new AuditLog("UNBAN_USER", "admin:" + adminId, "Unbanned user ID: " + id);
        auditLogRepository.save(auditLog);

        log.info("User [{}] unbanned and audit log saved", id);
    }

    
    /* ================================================================
     * METHOD: getAllJobs
     * DESCRIPTION:
     * Retrieves all jobs from JobService for admin-level access.
     * ================================================================ */
    public List<JobResponse> getAllJobs() {
        log.debug("Fetching jobs from JobService");
        List<JobResponse> jobs = adminJobClient.getAllJobs();
        log.info("Total jobs fetched: {}", jobs.size());
        return jobs;
    }

    public PagedResponse<JobResponse> getAllJobsPaged(int page, int size, String company) {
        log.info("Fetching paginated jobs [company={}] from JobService — page: {}, size: {}", 
            company, page, size);
        return adminJobClient.getAllJobsPaged(page, size, company);
    }

    
    /* ================================================================
     * METHOD: deleteJob
     * DESCRIPTION:
     * Deletes a job by ID and records the action in audit logs.
     * ================================================================ */
    public void deleteJob(Long id, Long adminId) {

        log.info("Admin [{}] deleting job [{}]", adminId, id);

        adminJobClient.deleteJob(id);

        AuditLog auditLog = new AuditLog("DELETE_JOB", "admin:" + adminId, "Deleted job ID: " + id);
        auditLogRepository.save(auditLog);

        log.info("Job [{}] deleted and audit log saved", id);
    }
    

    /* ================================================================
     * METHOD: getReport
     * DESCRIPTION:
     * Generates a comprehensive platform report including users,
     * jobs, and application statistics.
     * ================================================================ */
    public PlatformReport getReport() {

        log.info("Generating platform report");

        List<UserResponse> users = authServiceClient.getAllUsers();
        log.debug("Users fetched: {}", users.size());

        List<JobResponse> jobs = adminJobClient.getAllJobs();
        log.debug("Jobs fetched: {}", jobs.size());

        ApplicationStats stats = adminAppClient.getStats();
        log.debug("Application stats fetched");

        PlatformReport report = new PlatformReport();
        report.setTotalUsers(users.size());
        report.setTotalJobs(jobs.size());
        
        long seekerCount = users.stream().filter(u -> "JOB_SEEKER".equals(u.getRole())).count();
        long recruiterCount = users.stream().filter(u -> "RECRUITER".equals(u.getRole())).count();
        
        report.setSeekerCount(seekerCount);
        report.setRecruiterCount(recruiterCount);
        
        report.setApplicationStats(stats);
        report.setUsers(users);
        report.setJobs(jobs);

        log.info("Report ready: users={}, jobs={}, seekers={}, recruiters={}", 
            users.size(), jobs.size(), seekerCount, recruiterCount);

        return report;
    }

    
    /* ================================================================
     * METHOD: getAuditLogs
     * DESCRIPTION:
     * Retrieves all audit logs for admin monitoring and tracking.
     * ================================================================ */
    public List<AuditLog> getAuditLogs() {
        log.debug("Fetching audit logs");
        List<AuditLog> logs = auditLogRepository.findAll();
        log.info("Total logs fetched: {}", logs.size());
        return logs;
    }

    /* ================================================================
     * METHOD: getMarketPulse
     * DESCRIPTION:
     * Calculates real-time job market insights including average salary,
     * demand status, and top trending skills based on platform jobs.
     * ================================================================ */
    public JobMarketPulseResponse getMarketPulse() {
        log.info("Calculating Job Market Pulse insights");

        List<JobResponse> jobs = adminJobClient.getAllJobs();
        
        // 1. Calculate Average Salary
        java.math.BigDecimal totalSalary = java.math.BigDecimal.ZERO;
        int salaryCount = 0;
        for (JobResponse job : jobs) {
            if (job.getSalary() != null && job.getSalary().compareTo(java.math.BigDecimal.ZERO) > 0) {
                totalSalary = totalSalary.add(job.getSalary());
                salaryCount++;
            }
        }
        
        java.math.BigDecimal avgSalary = salaryCount > 0 
            ? totalSalary.divide(java.math.BigDecimal.valueOf(salaryCount), 2, java.math.RoundingMode.HALF_UP)
            : java.math.BigDecimal.ZERO;

        // 2. Determine Market Demand
        String demandStatus = "Moderate";
        String demandSubtitle = "Peaking Now";
        if (jobs.size() > 50) {
            demandStatus = "High";
            demandSubtitle = "Booming Market";
        } else if (jobs.size() < 10) {
            demandStatus = "Low";
            demandSubtitle = "Selective Hiring";
        }

        // 3. Extract Top Skills
        java.util.Map<String, Integer> skillCounts = new java.util.HashMap<>();
        for (JobResponse job : jobs) {
            if (job.getSkillsRequired() != null) {
                String[] skills = job.getSkillsRequired().split(",");
                for (String skill : skills) {
                    String trimmedSkill = skill.trim();
                    if (!trimmedSkill.isEmpty()) {
                        skillCounts.put(trimmedSkill, skillCounts.getOrDefault(trimmedSkill, 0) + 1);
                    }
                }
            }
        }

        List<JobMarketPulseResponse.SkillDemand> topSkills = skillCounts.entrySet().stream()
            .sorted(java.util.Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(3)
            .map(entry -> {
                double percentage = (double) entry.getValue() / Math.max(1, jobs.size()) * 100;
                return new JobMarketPulseResponse.SkillDemand(entry.getKey(), Math.round(percentage));
            })
            .collect(java.util.stream.Collectors.toList());

        if (topSkills.isEmpty()) {
            topSkills.add(new JobMarketPulseResponse.SkillDemand("Python", 0));
            topSkills.add(new JobMarketPulseResponse.SkillDemand("React", 0));
            topSkills.add(new JobMarketPulseResponse.SkillDemand("Node.js", 0));
        }

        return new JobMarketPulseResponse(
            avgSalary,
            4.2, 
            demandStatus,
            demandSubtitle,
            topSkills
        );
    }
}