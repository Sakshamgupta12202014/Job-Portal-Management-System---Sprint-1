package com.capg.jobportal.test.security;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.capg.jobportal.security.JwtUtil;

import io.jsonwebtoken.Claims;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "mysecretkeywithatleast256bitsforsecuritypurposes!");
        ReflectionTestUtils.setField(jwtUtil, "accessExpiryMs", 3600000L);
        ReflectionTestUtils.setField(jwtUtil, "refreshExpiryMs", 7200000L);
    }

    @Test
    void generateAccessToken_success() {
        String token = jwtUtil.generateAccessToken(1L, "JOB_SEEKER");
        assertNotNull(token);
        assertEquals("1", jwtUtil.extractUserId(token));
        assertEquals("JOB_SEEKER", jwtUtil.extractRole(token));
    }

    @Test
    void isTokenValid_success() {
        String token = jwtUtil.generateAccessToken(1L, "JOB_SEEKER");
        assertTrue(jwtUtil.isTokenValid(token));
    }

    @Test
    void isTokenValid_failure_invalidToken() {
        assertFalse(jwtUtil.isTokenValid("invalid-token"));
    }

    @Test
    void generateRefreshToken_success() {
        String refreshToken = jwtUtil.generateRefreshToken();
        assertNotNull(refreshToken);
    }
    
    @Test
    void extractAllClaims_success() {
        String token = jwtUtil.generateAccessToken(1L, "RECRUITER");
        Claims claims = jwtUtil.extractAllClaims(token);
        assertEquals("RECRUITER", claims.get("role"));
    }

    @Test
    void isTokenValid_failure_expiredToken() {
        ReflectionTestUtils.setField(jwtUtil, "accessExpiryMs", -1000L);
        String token = jwtUtil.generateAccessToken(1L, "JOB_SEEKER");
        assertFalse(jwtUtil.isTokenValid(token));
    }
}
