package com.capg.jobportal.test.security;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.annotation.web.configurers.SessionManagementConfigurer;
import org.springframework.security.web.SecurityFilterChain;

import com.capg.jobportal.security.SecurityConfig;

class SecurityConfigTest {

    @Test
    @SuppressWarnings("unchecked")
    void securityFilterChain_creation() throws Exception {
        SecurityConfig config = new SecurityConfig();
        HttpSecurity http = mock(HttpSecurity.class, RETURNS_DEEP_STUBS);

        when(http.csrf(any())).thenAnswer(invocation -> {
            Customizer<CsrfConfigurer<HttpSecurity>> customizer = invocation.getArgument(0);
            customizer.customize(mock(CsrfConfigurer.class));
            return http;
        });
        when(http.sessionManagement(any())).thenAnswer(invocation -> {
            Customizer<SessionManagementConfigurer<HttpSecurity>> customizer = invocation.getArgument(0);
            customizer.customize(mock(SessionManagementConfigurer.class));
            return http;
        });
        when(http.authorizeHttpRequests(any())).thenAnswer(invocation -> {
            Customizer<AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry> customizer = invocation.getArgument(0);
            AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry registry = mock(AuthorizeHttpRequestsConfigurer.AuthorizationManagerRequestMatcherRegistry.class);
            AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizedUrl authorizedUrl = mock(AuthorizeHttpRequestsConfigurer.AuthorizedUrl.class);
            when(registry.anyRequest()).thenReturn(authorizedUrl);
            customizer.customize(registry);
            return http;
        });

        org.springframework.security.web.DefaultSecurityFilterChain mockChain = mock(org.springframework.security.web.DefaultSecurityFilterChain.class);
        when(http.build()).thenReturn(mockChain);

        SecurityFilterChain chain = config.securityFilterChain(http);

        assertEquals(mockChain, chain);
        verify(http).build();
    }
    @Test
    void passwordEncoder_returnsBcrypt() {
        SecurityConfig config = new SecurityConfig();
        assertNotNull(config.passwordEncoder());
    }
}
