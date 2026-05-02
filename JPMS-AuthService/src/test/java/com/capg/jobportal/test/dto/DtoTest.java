package com.capg.jobportal.test.dto;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import com.capg.jobportal.dto.*;
import com.capg.jobportal.enums.Role;

class DtoTest {

    @Test
    void authResponseTest() {
        AuthResponse resp1 = new AuthResponse("msg");
        assertEquals("msg", resp1.getMessage());

        AuthResponse resp2 = new AuthResponse("at", "rt", "ROLE", 1L, "name", "email");
        assertEquals("at", resp2.getAccessToken());
        assertEquals("rt", resp2.getRefreshToken());
        assertEquals("ROLE", resp2.getRole());
        assertEquals(1L, resp2.getUserId());
        assertEquals("name", resp2.getName());
        assertEquals("email", resp2.getEmail());

        resp2.setAccessToken("at2");
        resp2.setRefreshToken("rt2");
        resp2.setRole("ROLE2");
        resp2.setUserId(2L);
        resp2.setName("name2");
        resp2.setEmail("email2");
        resp2.setMessage("msg2");

        assertEquals("at2", resp2.getAccessToken());
        assertEquals("rt2", resp2.getRefreshToken());
        assertEquals("ROLE2", resp2.getRole());
        assertEquals(2L, resp2.getUserId());
        assertEquals("name2", resp2.getName());
        assertEquals("email2", resp2.getEmail());
        assertEquals("msg2", resp2.getMessage());
    }

    @Test
    void loginRequestTest() {
        LoginRequest req = new LoginRequest();
        req.setEmail("email");
        req.setPassword("pass");
        assertEquals("email", req.getEmail());
        assertEquals("pass", req.getPassword());
    }

    @Test
    void registerRequestTest() {
        RegisterRequest req = new RegisterRequest();
        req.setName("name");
        req.setEmail("email");
        req.setPassword("pass");
        req.setRole(Role.JOB_SEEKER);
        req.setPhone("123");

        assertEquals("name", req.getName());
        assertEquals("email", req.getEmail());
        assertEquals("pass", req.getPassword());
        assertEquals(Role.JOB_SEEKER, req.getRole());
        assertEquals("123", req.getPhone());
    }

    @Test
    void errorResponseTest() {
        ErrorResponse resp = new ErrorResponse(400, "Bad Request", "Error message");
        assertEquals(400, resp.getStatus());
        assertEquals("Bad Request", resp.getError());
        assertEquals("Error message", resp.getMessage());

        resp.setStatus(500);
        resp.setError("Internal Error");
        resp.setMessage("New error");

        assertEquals(500, resp.getStatus());
        assertEquals("Internal Error", resp.getError());
        assertEquals("New error", resp.getMessage());
    }

    @Test
    void userInfoResponseTest() {
        UserInfoResponse resp = new UserInfoResponse();
        resp.setId(1L);
        resp.setName("name");
        resp.setEmail("email");

        assertEquals(1L, resp.getId());
        assertEquals("name", resp.getName());
        assertEquals("email", resp.getEmail());
    }
}
