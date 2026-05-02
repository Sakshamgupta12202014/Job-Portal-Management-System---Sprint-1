package com.capg.jobportal.test;

import org.junit.jupiter.api.Test;
import com.capg.jobportal.JpmsNotificationServiceApplication;

class ApplicationTest {

    @Test
    void testAppInstance() {
        JpmsNotificationServiceApplication app = new JpmsNotificationServiceApplication();
        org.junit.jupiter.api.Assertions.assertNotNull(app);
    }
}
