package com.capg.jobportal.test.entity;

import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import com.capg.jobportal.entity.User;
import com.capg.jobportal.enums.Role;
import com.capg.jobportal.enums.UserStatus;

class UserTest {

    @Test
    void userEntity_prePersist() {
        User user = new User();
        ReflectionTestUtils.invokeMethod(user, "onCreate");
        
        assertNotNull(user.getCreatedAt());
        assertNotNull(user.getUpdatedAt());
    }

    @Test
    void userEntity_preUpdate() {
        User user = new User();
        ReflectionTestUtils.invokeMethod(user, "onUpdate");
        
        assertNotNull(user.getUpdatedAt());
    }

    @Test
    void userEntity_fullConstructorAndGetters() {
        LocalDateTime now = LocalDateTime.now();
        User user = new User(1L, "Name", "email@test.com", "pass", Role.JOB_SEEKER, "123", UserStatus.ACTIVE, "pic", "resume", "token", now, now);
        
        assertEquals(1L, user.getId());
        assertEquals("Name", user.getName());
        assertEquals("email@test.com", user.getEmail());
        assertEquals("pass", user.getPassword());
        assertEquals(Role.JOB_SEEKER, user.getRole());
        assertEquals("123", user.getPhone());
        assertEquals(UserStatus.ACTIVE, user.getStatus());
        assertEquals("pic", user.getProfilePictureUrl());
        assertEquals("resume", user.getResumeUrl());
        assertEquals("token", user.getRefreshToken());
        assertEquals(now, user.getCreatedAt());
        assertEquals(now, user.getUpdatedAt());
    }

    @Test
    void userEntity_setters() {
        User user = new User();
        user.setId(2L);
        user.setName("New Name");
        user.setEmail("new@test.com");
        user.setPassword("newpass");
        user.setRole(Role.RECRUITER);
        user.setPhone("456");
        user.setStatus(UserStatus.BANNED);
        user.setProfilePictureUrl("newpic");
        user.setResumeUrl("newresume");
        user.setRefreshToken("newtoken");

        assertEquals(2L, user.getId());
        assertEquals("New Name", user.getName());
        assertEquals("new@test.com", user.getEmail());
        assertEquals("newpass", user.getPassword());
        assertEquals(Role.RECRUITER, user.getRole());
        assertEquals("456", user.getPhone());
        assertEquals(UserStatus.BANNED, user.getStatus());
        assertEquals("newpic", user.getProfilePictureUrl());
        assertEquals("newresume", user.getResumeUrl());
        assertEquals("newtoken", user.getRefreshToken());
    }
}
