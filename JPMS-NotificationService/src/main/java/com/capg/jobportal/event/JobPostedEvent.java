package com.capg.jobportal.event;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobPostedEvent {
    private Long jobId;
    private String title;
    private String companyName;
    private String location;
    private String jobType;
    private BigDecimal salary;
    private Integer experienceYears;
    private String description;
}