package com.capg.jobportal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.capg.jobportal.event.JobAppliedEvent;
import com.capg.jobportal.event.JobPostedEvent;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendJobAlert(String toEmail, JobPostedEvent event) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("New Job Alert: " + event.getTitle() + " at " + event.getCompanyName());
        message.setText(buildEmailBody(event));
        mailSender.send(message);
    }

    private String buildEmailBody(JobPostedEvent event) {
        return "Hello Job Seeker,\n\n" +
               "A new job has been posted that might interest you!\n\n" +
               "Job Title    : " + event.getTitle() + "\n" +
               "Company      : " + event.getCompanyName() + "\n" +
               "Location     : " + event.getLocation() + "\n" +
               "Job Type     : " + event.getJobType() + "\n" +
               "Salary       : " + (event.getSalary() != null ? event.getSalary() : "Not specified") + "\n" +
               "Experience   : " + (event.getExperienceYears() != null ? event.getExperienceYears() + " years" : "Not specified") + "\n\n" +
               "Description  : " + event.getDescription() + "\n\n" +
               "Log in to the Job Portal to apply now!\n\n" +
               "Best regards,\nJob Portal Team";
    }
    
    public void sendApplicationAlert(String recruiterEmail, JobAppliedEvent event) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recruiterEmail);
        message.setSubject("New Application Received: " + event.getJobTitle());
        message.setText(buildApplicationEmailBody(event));
        mailSender.send(message);
    }

    private String buildApplicationEmailBody(JobAppliedEvent event) {
        return "Hello Recruiter,\n\n" +
               "You have received a new application for your job posting!\n\n" +
               "Job Title    : " + event.getJobTitle() + "\n" +
               "Applicant    : " + event.getSeekerName() + "\n" +
               "Email        : " + event.getSeekerEmail() + "\n\n" +
               "Log in to the Job Portal to review the application.\n\n" +
               "Best regards,\nJob Portal Team";
    }
}