package com.capg.jobportal.test.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.web.servlet.MockMvc;

import com.capg.jobportal.controller.InternalAuthController;
import com.capg.jobportal.dto.UserProfileResponse;
import com.capg.jobportal.security.SecurityConfig;
import com.capg.jobportal.service.AuthService;

@WebMvcTest(
    controllers = InternalAuthController.class,
    excludeAutoConfiguration = SecurityAutoConfiguration.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = SecurityConfig.class
    )
)
class InternalAuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Test
    void getAllUsers_success() throws Exception {
        when(authService.getAllUsers()).thenReturn(Arrays.asList(new UserProfileResponse()));
        mockMvc.perform(get("/api/internal/users"))
                .andExpect(status().isOk());
    }

    @Test
    void deleteUser_success() throws Exception {
        doNothing().when(authService).deleteUser(1L);
        mockMvc.perform(delete("/api/internal/users/1"))
                .andExpect(status().isOk());
    }

    @Test
    void banUser_success() throws Exception {
        doNothing().when(authService).updateUserStatus(1L, "BANNED");
        mockMvc.perform(put("/api/internal/users/1/ban"))
                .andExpect(status().isOk());
    }

    @Test
    void unbanUser_success() throws Exception {
        doNothing().when(authService).updateUserStatus(1L, "ACTIVE");
        mockMvc.perform(put("/api/internal/users/1/unban"))
                .andExpect(status().isOk());
    }

    @Test
    void invalidateToken_success() throws Exception {
        doNothing().when(authService).invalidateTokenByUserId(1L);
        mockMvc.perform(put("/api/internal/users/1/invalidate-token"))
                .andExpect(status().isOk());
    }

    @Test
    void getJobSeekerEmails_success() throws Exception {
        when(authService.getJobSeekerEmails()).thenReturn(Arrays.asList("test@test.com"));
        mockMvc.perform(get("/api/internal/users/job-seeker-emails"))
                .andExpect(status().isOk());
    }

    @Test
    void getUserInfo_success() throws Exception {
        UserProfileResponse profile = new UserProfileResponse();
        profile.setId(1L);
        profile.setName("Test");
        profile.setEmail("test@test.com");
        when(authService.getProfile(1L)).thenReturn(profile);
        mockMvc.perform(get("/api/internal/users/1/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test"));
    }
}
