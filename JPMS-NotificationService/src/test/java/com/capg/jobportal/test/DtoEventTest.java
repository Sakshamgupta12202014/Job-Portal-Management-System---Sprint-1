package com.capg.jobportal.test;

import static org.junit.jupiter.api.Assertions.*;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import com.capg.jobportal.dto.UserInfoResponse;
import com.capg.jobportal.event.JobAppliedEvent;
import com.capg.jobportal.event.JobPostedEvent;

class DtoEventTest {

    @Test
    void jobPostedEventTest() {
        JobPostedEvent event = new JobPostedEvent();
        event.setJobId(1L);
        event.setTitle("T");
        event.setCompanyName("C");
        event.setLocation("L");
        event.setJobType("J");
        event.setSalary(BigDecimal.ONE);
        event.setExperienceYears(1);
        event.setDescription("D");

        assertEquals(1L, event.getJobId());
        assertEquals("T", event.getTitle());
        assertEquals("C", event.getCompanyName());
        assertEquals("L", event.getLocation());
        assertEquals("J", event.getJobType());
        assertEquals(BigDecimal.ONE, event.getSalary());
        assertEquals(1, event.getExperienceYears());
        assertEquals("D", event.getDescription());
    }

    @Test
    void jobAppliedEventTest() {
        JobAppliedEvent event = new JobAppliedEvent();
        event.setJobId(1L);
        event.setJobTitle("T");
        event.setSeekerId(10L);
        event.setSeekerName("S");
        event.setSeekerEmail("E");
        event.setRecruiterId(2L);

        assertEquals(1L, event.getJobId());
        assertEquals("T", event.getJobTitle());
        assertEquals(10L, event.getSeekerId());
        assertEquals("S", event.getSeekerName());
        assertEquals("E", event.getSeekerEmail());
        assertEquals(2L, event.getRecruiterId());
    }

    @Test
    void userInfoResponseTest() {
        UserInfoResponse resp = new UserInfoResponse();
        resp.setId(1L);
        resp.setName("N");
        resp.setEmail("E");

        assertEquals(1L, resp.getId());
        assertEquals("N", resp.getName());
        assertEquals("E", resp.getEmail());
    }
}
