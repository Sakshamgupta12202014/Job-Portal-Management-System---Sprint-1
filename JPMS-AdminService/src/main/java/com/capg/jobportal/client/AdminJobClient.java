package com.capg.jobportal.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import com.capg.jobportal.dto.JobResponse;
import com.capg.jobportal.dto.PagedResponse;

import java.util.List;

@FeignClient(name = "job-service")
public interface AdminJobClient {

    @GetMapping("/api/internal/jobs/all")
    List<JobResponse> getAllJobs();

    @GetMapping("/api/internal/jobs/all/paged")
    PagedResponse<JobResponse> getAllJobsPaged(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam(value = "company", required = false) String company);

    @DeleteMapping("/api/internal/jobs/{id}")
    void deleteJob(@PathVariable Long id);
}
