package com.capg.jobportal.dto;

import com.capg.jobportal.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
	
	private Long id;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String status;
    private String profilePictureUrl;
    private String resumeUrl;
    private String bio;
    private String location;
    private String skills;
    private Integer experienceYears;
    
    public static UserProfileResponse fromEntity(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.id = user.getId();
        response.name = user.getName();
        response.email = user.getEmail();
        response.role = user.getRole().name();
        response.phone = user.getPhone();
        response.status = user.getStatus().name();
        response.profilePictureUrl = user.getProfilePictureUrl();
        response.resumeUrl = user.getResumeUrl();
        response.bio = user.getBio();
        response.location = user.getLocation();
        response.skills = user.getSkills();
        response.experienceYears = user.getExperienceYears();
        return response;
    }
}
