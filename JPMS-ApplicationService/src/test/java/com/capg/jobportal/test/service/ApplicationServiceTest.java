package com.capg.jobportal.test.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import com.capg.jobportal.client.AuthServiceClient;
import com.capg.jobportal.client.JobServiceClient;
import com.capg.jobportal.dao.ApplicationRepository;
import com.capg.jobportal.dto.ApplicationResponse;
import com.capg.jobportal.dto.ApplicationStats;
import com.capg.jobportal.dto.JobClientResponse;
import com.capg.jobportal.dto.RecruiterApplicationResponse;
import com.capg.jobportal.dto.StatusUpdateRequest;
import com.capg.jobportal.dto.UserInfoResponse;
import com.capg.jobportal.entity.Application;
import com.capg.jobportal.enums.ApplicationStatus;
import com.capg.jobportal.exception.DuplicateApplicationException;
import com.capg.jobportal.exception.ForbiddenException;
import com.capg.jobportal.exception.InvalidStatusTransitionException;
import com.capg.jobportal.exception.ResourceNotFoundException;
import com.capg.jobportal.service.ApplicationService;
import com.capg.jobportal.util.CloudinaryUtil;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private JobServiceClient jobServiceClient;

    @Mock
    private CloudinaryUtil cloudinaryUtil;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private AuthServiceClient authServiceClient;

    @InjectMocks
    private ApplicationService applicationService;

    private Application testApplication;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(applicationService, "exchange", "test-exchange");
        ReflectionTestUtils.setField(applicationService, "routingKey", "test-routing-key");

        testApplication = new Application();
        testApplication.setId(1L);
        testApplication.setUserId(100L);
        testApplication.setJobId(200L);
        testApplication.setResumeUrl("https://cloudinary.com/resume.pdf");
        testApplication.setCoverLetter("I am interested in this role");
        testApplication.setStatus(ApplicationStatus.APPLIED);
    }

    @Test
    void applyForJob_success_existingResume() throws IOException {
        JobClientResponse job = createMockJob("ACTIVE");
        UserInfoResponse user = createMockUser();

        when(jobServiceClient.getJobById(200L, "100", "JOB_SEEKER")).thenReturn(job);
        when(applicationRepository.existsByUserIdAndJobId(100L, 200L)).thenReturn(false);
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);
        when(authServiceClient.getUserInfo(100L)).thenReturn(user);

        ApplicationResponse response = applicationService.applyForJob(200L, "Cover letter", true, "http://resume.pdf", null, 100L);

        assertNotNull(response);
        verify(rabbitTemplate).convertAndSend(eq("test-exchange"), eq("test-routing-key"), any(Object.class));
    }

    @Test
    void applyForJob_success_newResume() throws IOException {
        JobClientResponse job = createMockJob("ACTIVE");
        UserInfoResponse user = createMockUser();
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);

        when(jobServiceClient.getJobById(200L, "100", "JOB_SEEKER")).thenReturn(job);
        when(applicationRepository.existsByUserIdAndJobId(100L, 200L)).thenReturn(false);
        when(cloudinaryUtil.uploadResume(file)).thenReturn("http://new-resume.pdf");
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);
        when(authServiceClient.getUserInfo(100L)).thenReturn(user);

        applicationService.applyForJob(200L, "Cover letter", false, null, file, 100L);

        verify(cloudinaryUtil).uploadResume(file);
    }

    @Test
    void applyForJob_jobNotFound_throwsException() {
        when(jobServiceClient.getJobById(99L, "100", "JOB_SEEKER")).thenReturn(null);
        assertThrows(ResourceNotFoundException.class, () -> applicationService.applyForJob(99L, "cl", true, "url", null, 100L));
    }

    @Test
    void applyForJob_jobDeleted_throwsException() {
        JobClientResponse job = createMockJob("DELETED");
        when(jobServiceClient.getJobById(200L, "100", "JOB_SEEKER")).thenReturn(job);
        assertThrows(ResourceNotFoundException.class, () -> applicationService.applyForJob(200L, "cl", true, "url", null, 100L));
    }

    @Test
    void applyForJob_jobClosed_throwsException() {
        JobClientResponse job = createMockJob("CLOSED");
        when(jobServiceClient.getJobById(200L, "100", "JOB_SEEKER")).thenReturn(job);
        assertThrows(ResourceNotFoundException.class, () -> applicationService.applyForJob(200L, "cl", true, "url", null, 100L));
    }

    @Test
    void applyForJob_deadlinePassed_throwsException() {
        JobClientResponse job = createMockJob("ACTIVE");
        job.setDeadline(LocalDate.now().minusDays(1));
        when(jobServiceClient.getJobById(200L, "100", "JOB_SEEKER")).thenReturn(job);
        assertThrows(IllegalArgumentException.class, () -> applicationService.applyForJob(200L, "cl", true, "url", null, 100L));
    }

    @Test
    void applyForJob_duplicate_throwsException() {
        JobClientResponse job = createMockJob("ACTIVE");
        when(jobServiceClient.getJobById(200L, "100", "JOB_SEEKER")).thenReturn(job);
        when(applicationRepository.existsByUserIdAndJobId(100L, 200L)).thenReturn(true);
        assertThrows(DuplicateApplicationException.class, () -> applicationService.applyForJob(200L, "cl", true, "url", null, 100L));
    }

    @Test
    void applyForJob_existingResumeUrlEmpty_throwsException() {
        JobClientResponse job = createMockJob("ACTIVE");
        when(jobServiceClient.getJobById(200L, "100", "JOB_SEEKER")).thenReturn(job);
        assertThrows(IllegalArgumentException.class, () -> applicationService.applyForJob(200L, "cl", true, "", null, 100L));
    }

    @Test
    void applyForJob_resumeFileEmpty_throwsException() {
        JobClientResponse job = createMockJob("ACTIVE");
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(true);
        when(jobServiceClient.getJobById(200L, "100", "JOB_SEEKER")).thenReturn(job);
        assertThrows(IllegalArgumentException.class, () -> applicationService.applyForJob(200L, "cl", false, null, file, 100L));
    }

    @Test
    void applyForJob_eventFailure_stillSucceeds() throws IOException {
        JobClientResponse job = createMockJob("ACTIVE");
        when(jobServiceClient.getJobById(200L, "100", "JOB_SEEKER")).thenReturn(job);
        when(applicationRepository.existsByUserIdAndJobId(100L, 200L)).thenReturn(false);
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);
        when(authServiceClient.getUserInfo(100L)).thenThrow(new RuntimeException("MQ Error"));

        ApplicationResponse response = applicationService.applyForJob(200L, "cl", true, "url", null, 100L);
        assertNotNull(response);
    }

    @Test
    void getMyApplications_success() {
        when(applicationRepository.findByUserId(100L)).thenReturn(Arrays.asList(testApplication));
        List<ApplicationResponse> results = applicationService.getMyApplications(100L);
        assertEquals(1, results.size());
    }

    @Test
    void getApplicationById_success() {
        when(applicationRepository.findByIdAndUserId(1L, 100L)).thenReturn(Optional.of(testApplication));
        ApplicationResponse response = applicationService.getApplicationById(1L, 100L);
        assertNotNull(response);
    }

    @Test
    void getApplicationById_forbidden_throwsException() {
        when(applicationRepository.findByIdAndUserId(1L, 100L)).thenReturn(Optional.empty());
        assertThrows(ForbiddenException.class, () -> applicationService.getApplicationById(1L, 100L));
    }

    @Test
    void getApplicantsForJob_success() {
        JobClientResponse job = createMockJob("ACTIVE");
        when(jobServiceClient.getJobById(200L, "500", "RECRUITER")).thenReturn(job);
        when(applicationRepository.findByJobId(200L)).thenReturn(Arrays.asList(testApplication));

        List<RecruiterApplicationResponse> results = applicationService.getApplicantsForJob(200L, 500L);
        assertEquals(1, results.size());
    }

    @Test
    void getApplicantsForJob_jobNotFound_throwsException() {
        when(jobServiceClient.getJobById(200L, "500", "RECRUITER")).thenReturn(null);
        assertThrows(ResourceNotFoundException.class, () -> applicationService.getApplicantsForJob(200L, 500L));
    }

    @Test
    void getApplicantsForJob_notOwner_throwsForbidden() {
        JobClientResponse job = createMockJob("ACTIVE");
        job.setPostedBy(999L);
        when(jobServiceClient.getJobById(200L, "500", "RECRUITER")).thenReturn(job);
        assertThrows(ForbiddenException.class, () -> applicationService.getApplicantsForJob(200L, 500L));
    }

    @Test
    void updateApplicationStatus_success() {
        JobClientResponse job = createMockJob("ACTIVE");
        StatusUpdateRequest request = new StatusUpdateRequest();
        request.setNewStatus(ApplicationStatus.UNDER_REVIEW);
        request.setRecruiterNote("Note");

        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(jobServiceClient.getJobById(200L, "500", "RECRUITER")).thenReturn(job);
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        applicationService.updateApplicationStatus(1L, request, 500L);
        assertEquals(ApplicationStatus.UNDER_REVIEW, testApplication.getStatus());
        assertEquals("Note", testApplication.getRecruiterNote());
    }

    @Test
    void updateApplicationStatus_notFound_throwsException() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> applicationService.updateApplicationStatus(1L, new StatusUpdateRequest(), 500L));
    }

    @Test
    void updateApplicationStatus_notOwner_throwsForbidden() {
        JobClientResponse job = createMockJob("ACTIVE");
        job.setPostedBy(999L);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(jobServiceClient.getJobById(200L, "500", "RECRUITER")).thenReturn(job);
        assertThrows(ForbiddenException.class, () -> applicationService.updateApplicationStatus(1L, new StatusUpdateRequest(), 500L));
    }

    @Test
    void validateStatusTransition_validTransitions() {
        JobClientResponse job = createMockJob("ACTIVE");
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(jobServiceClient.getJobById(anyLong(), anyString(), anyString())).thenReturn(job);
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        testApplication.setStatus(ApplicationStatus.APPLIED);
        applicationService.updateApplicationStatus(1L, createReq(ApplicationStatus.UNDER_REVIEW), 500L);

        testApplication.setStatus(ApplicationStatus.UNDER_REVIEW);
        applicationService.updateApplicationStatus(1L, createReq(ApplicationStatus.SHORTLISTED), 500L);

        testApplication.setStatus(ApplicationStatus.UNDER_REVIEW);
        applicationService.updateApplicationStatus(1L, createReq(ApplicationStatus.REJECTED), 500L);

        testApplication.setStatus(ApplicationStatus.SHORTLISTED);
        applicationService.updateApplicationStatus(1L, createReq(ApplicationStatus.REJECTED), 500L);
    }

    @Test
    void validateStatusTransition_invalidTransitions() {
        JobClientResponse job = createMockJob("ACTIVE");
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(jobServiceClient.getJobById(anyLong(), anyString(), anyString())).thenReturn(job);

        testApplication.setStatus(ApplicationStatus.REJECTED);
        assertThrows(InvalidStatusTransitionException.class, () -> applicationService.updateApplicationStatus(1L, createReq(ApplicationStatus.APPLIED), 500L));

        testApplication.setStatus(ApplicationStatus.APPLIED);
        assertThrows(InvalidStatusTransitionException.class, () -> applicationService.updateApplicationStatus(1L, createReq(ApplicationStatus.SHORTLISTED), 500L));
        
        testApplication.setStatus(ApplicationStatus.SHORTLISTED);
        assertThrows(InvalidStatusTransitionException.class, () -> applicationService.updateApplicationStatus(1L, createReq(ApplicationStatus.UNDER_REVIEW), 500L));
    }

    private StatusUpdateRequest createReq(ApplicationStatus status) {
        StatusUpdateRequest req = new StatusUpdateRequest();
        req.setNewStatus(status);
        return req;
    }

    @Test
    void getApplicationStats_success() {
        Application a1 = new Application(); a1.setStatus(ApplicationStatus.APPLIED);
        Application a2 = new Application(); a2.setStatus(ApplicationStatus.UNDER_REVIEW);
        Application a3 = new Application(); a3.setStatus(ApplicationStatus.SHORTLISTED);
        Application a4 = new Application(); a4.setStatus(ApplicationStatus.REJECTED);

        when(applicationRepository.findAll()).thenReturn(Arrays.asList(a1, a2, a3, a4));

        ApplicationStats stats = applicationService.getApplicationStats();
        assertEquals(4, stats.getTotalApplications());
        assertEquals(1, stats.getAppliedCount());
    }

    private JobClientResponse createMockJob(String status) {
        JobClientResponse job = new JobClientResponse();
        job.setId(200L);
        job.setStatus(status);
        job.setPostedBy(500L);
        job.setTitle("Java Dev");
        return job;
    }

    private UserInfoResponse createMockUser() {
        UserInfoResponse user = new UserInfoResponse();
        user.setId(100L);
        user.setName("Seeker");
        user.setEmail("seeker@test.com");
        return user;
    }
}
