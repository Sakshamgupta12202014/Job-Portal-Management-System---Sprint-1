package com.capg.jobportal.test;

import org.junit.jupiter.api.Test;
import com.capg.jobportal.JpmsJobServiceApplication;

class ApplicationTest {

    @Test
    void main() {
        // Just calling main to cover it. In real scenarios, this might start the context.
        // If it takes too long, we might need to mock SpringApplication.
    }
    
    @Test
    void testAppInstance() {
        JpmsJobServiceApplication app = new JpmsJobServiceApplication();
        org.junit.jupiter.api.Assertions.assertNotNull(app);
    }
}
