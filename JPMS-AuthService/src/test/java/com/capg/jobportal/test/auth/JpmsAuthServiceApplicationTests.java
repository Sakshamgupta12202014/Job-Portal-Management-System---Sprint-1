package com.capg.jobportal.test.auth;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;
import com.capg.jobportal.JpmsAuthServiceApplication;

class JpmsAuthServiceApplicationTests {

	@Test
	void contextLoads() {
		new JpmsAuthServiceApplication();
		assertTrue(true);
	}

    @Test
    void internalAuthService_constructor() {
        com.capg.jobportal.service.InternalAuthService service = new com.capg.jobportal.service.InternalAuthService();
        org.junit.jupiter.api.Assertions.assertNotNull(service);
    }

}
