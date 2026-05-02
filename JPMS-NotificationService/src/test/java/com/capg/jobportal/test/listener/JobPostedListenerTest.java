package com.capg.jobportal.test.listener;

import static org.mockito.Mockito.*;
import java.util.Arrays;
import java.util.Collections;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.capg.jobportal.client.AuthServiceClient;
import com.capg.jobportal.event.JobPostedEvent;
import com.capg.jobportal.listener.JobPostedListener;
import com.capg.jobportal.service.EmailService;

@ExtendWith(MockitoExtension.class)
class JobPostedListenerTest {

    @Mock
    private EmailService emailService;

    @Mock
    private AuthServiceClient authServiceClient;

    @InjectMocks
    private JobPostedListener jobPostedListener;

    @Test
    void handleJobPosted_success() {
        JobPostedEvent event = new JobPostedEvent();
        event.setTitle("Java Developer");
        
        when(authServiceClient.getJobSeekerEmails()).thenReturn(Arrays.asList("user1@test.com", "user2@test.com"));

        jobPostedListener.handleJobPosted(event);

        verify(emailService, times(2)).sendJobAlert(anyString(), eq(event));
    }

    @Test
    void handleJobPosted_emptyEmails_noEmailsSent() {
        JobPostedEvent event = new JobPostedEvent();
        when(authServiceClient.getJobSeekerEmails()).thenReturn(Collections.emptyList());

        jobPostedListener.handleJobPosted(event);

        verify(emailService, never()).sendJobAlert(anyString(), any());
    }

    @Test
    void handleJobPosted_nullEmails_noEmailsSent() {
        JobPostedEvent event = new JobPostedEvent();
        when(authServiceClient.getJobSeekerEmails()).thenReturn(null);

        jobPostedListener.handleJobPosted(event);

        verify(emailService, never()).sendJobAlert(anyString(), any());
    }

    @Test
    void handleJobPosted_authServiceException_handled() {
        JobPostedEvent event = new JobPostedEvent();
        when(authServiceClient.getJobSeekerEmails()).thenThrow(new RuntimeException("Auth failed"));

        jobPostedListener.handleJobPosted(event);

        verify(emailService, never()).sendJobAlert(anyString(), any());
    }

    @Test
    void handleJobPosted_emailServiceException_handled() {
        JobPostedEvent event = new JobPostedEvent();
        when(authServiceClient.getJobSeekerEmails()).thenReturn(Collections.singletonList("user@test.com"));
        doThrow(new RuntimeException("Email failed")).when(emailService).sendJobAlert(anyString(), any());

        jobPostedListener.handleJobPosted(event);

        verify(emailService).sendJobAlert(anyString(), eq(event));
    }
}
