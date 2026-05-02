package com.capg.jobportal.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobMarketPulseResponse {

    private BigDecimal avgSalary;
    private double salaryGrowthPercentage;
    private String marketDemandStatus;
    private String marketDemandSubtitle;
    private List<SkillDemand> topSkills;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillDemand {
        private String name;
        private double percentage;
    }
}
