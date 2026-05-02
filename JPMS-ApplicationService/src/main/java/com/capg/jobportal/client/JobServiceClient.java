package com.capg.jobportal.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import com.capg.jobportal.dto.JobClientResponse;
import com.capg.jobportal.dto.PagedResponse;

@FeignClient(name = "job-service")
public interface JobServiceClient {

	@GetMapping("/api/jobs/{id}")
    JobClientResponse getJobById(
            @PathVariable("id") Long id,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role
    );
	
	@GetMapping("/api/jobs/my-jobs")
    PagedResponse<JobClientResponse> getMyJobs(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestParam("page") int page,
            @RequestParam("size") int size
    );

}
