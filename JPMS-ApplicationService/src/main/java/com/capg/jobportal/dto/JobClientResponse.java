package com.capg.jobportal.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobClientResponse {
    private Long id;
    private String title;
    private String companyName;
    private String location;
    private Double salary;
    private Integer experienceYears;
    private String status;
    private Long postedBy;
    private LocalDate deadline;
}
