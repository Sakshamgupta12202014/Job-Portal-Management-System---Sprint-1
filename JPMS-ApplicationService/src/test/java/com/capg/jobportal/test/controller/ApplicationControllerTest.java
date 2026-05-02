package com.capg.jobportal.test.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.capg.jobportal.controller.ApplicationController;
import com.capg.jobportal.controller.InternalApplicationController;
import com.capg.jobportal.dto.ApplicationResponse;
import com.capg.jobportal.dto.ApplicationStats;
import com.capg.jobportal.dto.RecruiterApplicationResponse;
import com.capg.jobportal.dto.StatusUpdateRequest;
import com.capg.jobportal.enums.ApplicationStatus;
import com.capg.jobportal.service.ApplicationService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest({ApplicationController.class, InternalApplicationController.class})
@AutoConfigureMockMvc(addFilters = false)
class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ApplicationService applicationService;

    @Autowired
    private ObjectMapper objectMapper;

    private ApplicationResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockResponse = new ApplicationResponse();
        mockResponse.setId(1L);
        mockResponse.setJobId(200L);
        mockResponse.setUserId(100L);
        mockResponse.setStatus(ApplicationStatus.APPLIED);
    }

    @Test
    void applyForJob_success() throws Exception {
        when(applicationService.applyForJob(anyLong(), anyString(), anyBoolean(), anyString(), any(), anyLong()))
                .thenReturn(mockResponse);

        mockMvc.perform(multipart("/api/applications")
                        .param("jobId", "200")
                        .param("coverLetter", "cl")
                        .param("useExistingResume", "true")
                        .param("existingResumeUrl", "url")
                        .header("X-User-Id", "100")
                        .header("X-User-Role", "JOB_SEEKER"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void applyForJob_forbidden() throws Exception {
        mockMvc.perform(multipart("/api/applications")
                        .param("jobId", "200")
                        .header("X-User-Id", "100")
                        .header("X-User-Role", "RECRUITER"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getMyApplications_success() throws Exception {
        when(applicationService.getMyApplications(100L)).thenReturn(Arrays.asList(mockResponse));

        mockMvc.perform(get("/api/applications/my-applications")
                        .header("X-User-Id", "100")
                        .header("X-User-Role", "JOB_SEEKER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void getMyApplications_forbidden() throws Exception {
        mockMvc.perform(get("/api/applications/my-applications")
                        .header("X-User-Id", "100")
                        .header("X-User-Role", "RECRUITER"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getApplicationById_success() throws Exception {
        when(applicationService.getApplicationById(1L, 100L)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/applications/1")
                        .header("X-User-Id", "100")
                        .header("X-User-Role", "JOB_SEEKER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getApplicationById_forbidden() throws Exception {
        mockMvc.perform(get("/api/applications/1")
                        .header("X-User-Id", "100")
                        .header("X-User-Role", "RECRUITER"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getApplicantsForJob_success() throws Exception {
        RecruiterApplicationResponse rRes = new RecruiterApplicationResponse();
        rRes.setId(1L);
        when(applicationService.getApplicantsForJob(200L, 500L)).thenReturn(Arrays.asList(rRes));

        mockMvc.perform(get("/api/applications/job/200")
                        .header("X-User-Id", "500")
                        .header("X-User-Role", "RECRUITER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void getApplicantsForJob_forbidden() throws Exception {
        mockMvc.perform(get("/api/applications/job/200")
                        .header("X-User-Id", "500")
                        .header("X-User-Role", "JOB_SEEKER"))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateApplicationStatus_success() throws Exception {
        StatusUpdateRequest request = new StatusUpdateRequest();
        request.setNewStatus(ApplicationStatus.SHORTLISTED);
        
        when(applicationService.updateApplicationStatus(eq(1L), any(), eq(500L))).thenReturn(mockResponse);

        mockMvc.perform(patch("/api/applications/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .header("X-User-Id", "500")
                        .header("X-User-Role", "RECRUITER"))
                .andExpect(status().isOk());
    }

    @Test
    void updateApplicationStatus_forbidden() throws Exception {
        StatusUpdateRequest request = new StatusUpdateRequest();
        request.setNewStatus(ApplicationStatus.SHORTLISTED);

        mockMvc.perform(patch("/api/applications/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .header("X-User-Id", "500")
                        .header("X-User-Role", "JOB_SEEKER"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getStats_success() throws Exception {
        ApplicationStats stats = new ApplicationStats();
        when(applicationService.getApplicationStats()).thenReturn(stats);

        mockMvc.perform(get("/api/internal/applications/stats"))
                .andExpect(status().isOk());
    }
}
