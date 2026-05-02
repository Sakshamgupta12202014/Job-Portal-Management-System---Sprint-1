package com.capg.jobportal.test;

import static org.junit.jupiter.api.Assertions.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import org.junit.jupiter.api.Test;
import com.capg.jobportal.dto.*;
import com.capg.jobportal.entity.Job;
import com.capg.jobportal.enums.JobStatus;
import com.capg.jobportal.enums.JobType;

class DtoEntityTest {

    @Test
    void jobEntityTest() {
        Job job = new Job();
        job.setId(1L);
        job.setTitle("Title");
        job.setCompanyName("Company");
        job.setLocation("Location");
        job.setSalary(BigDecimal.TEN);
        job.setExperienceYears(1);
        job.setJobType(JobType.FULL_TIME);
        job.setSkillsRequired("Skills");
        job.setDescription("Desc");
        job.setStatus(JobStatus.ACTIVE);
        job.setDeadline(LocalDate.now());
        job.setPostedBy(1L);
        LocalDateTime now = LocalDateTime.now();
        job.setCreatedAt(now);
        job.setUpdatedAt(now);

        assertEquals(1L, job.getId());
        assertEquals("Title", job.getTitle());
        assertEquals("Company", job.getCompanyName());
        assertEquals("Location", job.getLocation());
        assertEquals(BigDecimal.TEN, job.getSalary());
        assertEquals(1, job.getExperienceYears());
        assertEquals(JobType.FULL_TIME, job.getJobType());
        assertEquals("Skills", job.getSkillsRequired());
        assertEquals("Desc", job.getDescription());
        assertEquals(JobStatus.ACTIVE, job.getStatus());
        assertNotNull(job.getDeadline());
        assertEquals(1L, job.getPostedBy());
        assertEquals(now, job.getCreatedAt());
        assertEquals(now, job.getUpdatedAt());
    }

    @Test
    void errorResponseTest() {
        ErrorResponse resp = new ErrorResponse(404, "Not Found", "Msg");
        assertEquals(404, resp.getStatus());
        assertEquals("Not Found", resp.getError());
        assertEquals("Msg", resp.getMessage());

        resp.setStatus(500);
        resp.setError("Error");
        resp.setMessage("New Msg");
        assertEquals(500, resp.getStatus());
        assertEquals("Error", resp.getError());
        assertEquals("New Msg", resp.getMessage());
    }

    @Test
    void jobRequestDTOTest() {
        JobRequestDTO dto = new JobRequestDTO();
        dto.setTitle("T");
        dto.setCompanyName("C");
        dto.setLocation("L");
        dto.setSalary(BigDecimal.ONE);
        dto.setExperienceYears(2);
        dto.setJobType("FULL_TIME");
        dto.setSkillsRequired("S");
        dto.setDescription("D");
        dto.setDeadline(LocalDate.now());

        assertEquals("T", dto.getTitle());
        assertEquals("C", dto.getCompanyName());
        assertEquals("L", dto.getLocation());
        assertEquals(BigDecimal.ONE, dto.getSalary());
        assertEquals(2, dto.getExperienceYears());
        assertEquals("FULL_TIME", dto.getJobType());
        assertEquals("S", dto.getSkillsRequired());
        assertEquals("D", dto.getDescription());
        assertNotNull(dto.getDeadline());
    }

    @Test
    void jobResponseDTOTest() {
        JobResponseDTO dto = new JobResponseDTO();
        dto.setId(1L);
        dto.setTitle("T");
        dto.setCompanyName("C");
        dto.setLocation("L");
        dto.setSalary(BigDecimal.ONE);
        dto.setExperienceYears(2);
        dto.setJobType("FULL_TIME");
        dto.setSkillsRequired("S");
        dto.setDescription("D");
        dto.setStatus("ACTIVE");
        dto.setDeadline(LocalDate.now());
        dto.setPostedBy(1L);
        dto.setCreatedAt(LocalDateTime.now());
        dto.setUpdatedAt(LocalDateTime.now());

        assertEquals(1L, dto.getId());
        assertEquals("T", dto.getTitle());
        assertEquals("C", dto.getCompanyName());
        assertEquals("L", dto.getLocation());
        assertEquals(BigDecimal.ONE, dto.getSalary());
        assertEquals(2, dto.getExperienceYears());
        assertEquals("FULL_TIME", dto.getJobType());
        assertEquals("S", dto.getSkillsRequired());
        assertEquals("D", dto.getDescription());
        assertEquals("ACTIVE", dto.getStatus());
        assertNotNull(dto.getDeadline());
        assertEquals(1L, dto.getPostedBy());
        assertNotNull(dto.getCreatedAt());
        assertNotNull(dto.getUpdatedAt());
    }

    @Test
    void pagedResponseTest() {
        PagedResponse<String> resp = new PagedResponse<>(Collections.singletonList("item"), 0, 1, 1L, true);
        assertEquals(1, resp.getContent().size());
        assertEquals(0, resp.getCurrentPage());
        assertEquals(1, resp.getTotalPages());
        assertEquals(1L, resp.getTotalElements());
        assertTrue(resp.isLast());

        resp.setContent(Collections.emptyList());
        resp.setCurrentPage(1);
        resp.setTotalPages(2);
        resp.setTotalElements(2L);
        resp.setLast(false);

        assertEquals(0, resp.getContent().size());
        assertEquals(1, resp.getCurrentPage());
        assertEquals(2, resp.getTotalPages());
        assertEquals(2L, resp.getTotalElements());
        assertFalse(resp.isLast());
    }
}
