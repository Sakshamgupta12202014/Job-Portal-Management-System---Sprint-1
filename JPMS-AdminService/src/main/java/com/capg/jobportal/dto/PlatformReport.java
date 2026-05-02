package com.capg.jobportal.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlatformReport {

    private long totalUsers;
    private long totalJobs;
    private long seekerCount;
    private long recruiterCount;
    private ApplicationStats applicationStats;
    private List<UserResponse> users;
    private List<JobResponse> jobs;

    public PlatformReport(long totalUsers, long totalJobs, ApplicationStats applicationStats) {
        this.totalUsers = totalUsers;
        this.totalJobs = totalJobs;
        this.applicationStats = applicationStats;
    }
}
