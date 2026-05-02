package com.capg.jobportal.entity;

import java.time.LocalDateTime;

import com.capg.jobportal.enums.Role;
import com.capg.jobportal.enums.UserStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
  
    @Column(nullable = false, length = 100)
    private String name;
  
    @Column(nullable = false, unique = true, length = 150)
    private String email;
  
    @Column(nullable = false)
    private String password;
  
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
  
    @Column(length = 20)
    private String phone;
  
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE;
  
    @Column(name = "profile_picture_url")
    private String profilePictureUrl;
  
    @Column(name = "resume_url")
    private String resumeUrl;
  
    @Column(name = "refresh_token")
    private String refreshToken;
  
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
  
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 100)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(name = "experience_years")
    private Integer experienceYears;
  
    public User(Long id, String name, String email, String password, Role role, String phone, UserStatus status,
                String profilePictureUrl, String resumeUrl, String refreshToken, LocalDateTime createdAt,
                LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.phone = phone;
        this.status = status;
        this.profilePictureUrl = profilePictureUrl;
        this.resumeUrl = resumeUrl;
        this.refreshToken = refreshToken;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
  
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
