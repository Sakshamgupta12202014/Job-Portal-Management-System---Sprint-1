package com.capg.jobportal.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobAppliedEvent {
    private Long jobId;
    private String jobTitle;
    private Long seekerId;
    private String seekerName;
    private String seekerEmail;
    private Long recruiterId;   // postedBy from job
}