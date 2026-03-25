package com.capg.jobportal.listener;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.capg.jobportal.client.AuthServiceClient;
import com.capg.jobportal.dto.UserInfoResponse;
import com.capg.jobportal.event.JobAppliedEvent;
import com.capg.jobportal.service.EmailService;

@Component
public class JobAppliedListener {

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuthServiceClient authServiceClient;

    @RabbitListener(queues = "${rabbitmq.applied.queue}")
    public void handleJobApplied(JobAppliedEvent event) {
        System.out.println("Received job applied event for job: " + event.getJobTitle());
        try {
            UserInfoResponse recruiter = authServiceClient.getUserInfo(event.getRecruiterId());
            emailService.sendApplicationAlert(recruiter.getEmail(), event);
            System.out.println("Application alert sent to recruiter: " + recruiter.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send application alert: " + e.getMessage());
        }
    }
}