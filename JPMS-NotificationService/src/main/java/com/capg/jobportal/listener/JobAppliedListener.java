package com.capg.jobportal.listener;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.capg.jobportal.client.AuthServiceClient;
import com.capg.jobportal.dto.UserInfoResponse;
import com.capg.jobportal.event.JobAppliedEvent;
import com.capg.jobportal.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class JobAppliedListener {

    private final EmailService emailService;
    private final AuthServiceClient authServiceClient;

    @RabbitListener(queues = "${rabbitmq.applied.queue}")
    public void handleJobApplied(JobAppliedEvent event) {
        log.info("Received job applied event for job: {}", event.getJobTitle());
        try {
            UserInfoResponse recruiter = authServiceClient.getUserInfo(event.getRecruiterId());
            emailService.sendApplicationAlert(recruiter.getEmail(), event);
            log.info("Application alert sent to recruiter: {}", recruiter.getEmail());
        } catch (Exception e) {
            log.error("Failed to send application alert: {}", e.getMessage());
        }
    }
}