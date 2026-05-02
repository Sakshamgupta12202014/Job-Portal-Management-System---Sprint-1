package com.capg.jobportal.test.listener;

import static org.mockito.Mockito.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.capg.jobportal.client.AuthServiceClient;
import com.capg.jobportal.dto.UserInfoResponse;
import com.capg.jobportal.event.JobAppliedEvent;
import com.capg.jobportal.listener.JobAppliedListener;
import com.capg.jobportal.service.EmailService;

@ExtendWith(MockitoExtension.class)
class JobAppliedListenerTest {

    @Mock
    private EmailService emailService;

    @Mock
    private AuthServiceClient authServiceClient;

    @InjectMocks
    private JobAppliedListener jobAppliedListener;

    @Test
    void handleJobApplied_success() {
        JobAppliedEvent event = new JobAppliedEvent();
        event.setRecruiterId(10L);
        event.setJobTitle("Java Developer");

        UserInfoResponse recruiter = new UserInfoResponse();
        recruiter.setEmail("recruiter@test.com");
        
        when(authServiceClient.getUserInfo(10L)).thenReturn(recruiter);

        jobAppliedListener.handleJobApplied(event);

        verify(emailService).sendApplicationAlert("recruiter@test.com", event);
    }

    @Test
    void handleJobApplied_exception_handled() {
        JobAppliedEvent event = new JobAppliedEvent();
        when(authServiceClient.getUserInfo(any())).thenThrow(new RuntimeException("API Down"));

        jobAppliedListener.handleJobApplied(event);

        verify(emailService, never()).sendApplicationAlert(anyString(), any());
    }
}
