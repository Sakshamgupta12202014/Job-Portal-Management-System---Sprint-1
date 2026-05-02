package com.capg.jobportal.listener;

import java.util.List;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.capg.jobportal.client.AuthServiceClient;
import com.capg.jobportal.event.JobPostedEvent;
import com.capg.jobportal.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class JobPostedListener {

    private final EmailService emailService;
    private final AuthServiceClient authServiceClient;

    @RabbitListener(queues = "${rabbitmq.queue}")
    public void handleJobPosted(JobPostedEvent event) {
        log.info("Received job posted event: {}", event.getTitle());

        try {
            List<String> emails = authServiceClient.getJobSeekerEmails();

            if (emails != null && !emails.isEmpty()) {
                log.info("Sending email to {} job seekers", emails.size());
                for (String email : emails) {
                    try {
                        emailService.sendJobAlert(email, event);
                        log.debug("Email sent to: {}", email);
                    } catch (Exception e) {
                        log.error("Failed to send email to {}: {}", email, e.getMessage());
                    }
                }
            }

        } catch (Exception e) {
            log.error("Error processing job posted event: {}", e.getMessage());
        }
    }
}
