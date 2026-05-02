package com.capg.jobportal.test.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import com.capg.jobportal.event.JobAppliedEvent;
import com.capg.jobportal.event.JobPostedEvent;
import com.capg.jobportal.service.EmailService;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @Test
    void sendJobAlert_success() {
        JobPostedEvent event = new JobPostedEvent();
        event.setJobId(1L);
        event.setTitle("Java Developer");
        event.setCompanyName("TechCorp");
        event.setLocation("Bangalore");
        event.setJobType("FULL_TIME");
        event.setSalary(new BigDecimal("1500000"));
        event.setExperienceYears(3);
        event.setDescription("Cool job");

        emailService.sendJobAlert("seeker@example.com", event);

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendJobAlert_nullFields_success() {
        JobPostedEvent event = new JobPostedEvent();
        event.setTitle("Java Developer");
        event.setCompanyName("TechCorp");
        // salary and experience left null to test ternary logic in buildEmailBody

        emailService.sendJobAlert("seeker@example.com", event);

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendApplicationAlert_success() {
        JobAppliedEvent event = new JobAppliedEvent();
        event.setJobId(1L);
        event.setJobTitle("Java Developer");
        event.setSeekerName("John Doe");
        event.setSeekerEmail("john@example.com");

        emailService.sendApplicationAlert("recruiter@example.com", event);

        verify(mailSender).send(any(SimpleMailMessage.class));
    }
}
