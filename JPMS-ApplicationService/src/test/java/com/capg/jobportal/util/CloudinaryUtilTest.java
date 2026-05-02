package com.capg.jobportal.util;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;


import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;

class CloudinaryUtilTest {

    @Spy
    @InjectMocks
    private CloudinaryUtil cloudinaryUtil;

    @Mock
    private MultipartFile multipartFile;

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(cloudinaryUtil, "cloudName", "test");
        ReflectionTestUtils.setField(cloudinaryUtil, "apiKey", "test");
        ReflectionTestUtils.setField(cloudinaryUtil, "apiSecret", "test");
    }

    @Test
    void validateResume_tooLarge_throwsException() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(10 * 1024 * 1024L); // 10MB

        assertThrows(IllegalArgumentException.class, () -> {
            ReflectionTestUtils.invokeMethod(cloudinaryUtil, "validateResume", multipartFile);
        });
    }

    @Test
    void validateResume_notPdf_throwsException() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1 * 1024 * 1024L);
        when(multipartFile.getContentType()).thenReturn("image/png");

        assertThrows(IllegalArgumentException.class, () -> {
            ReflectionTestUtils.invokeMethod(cloudinaryUtil, "validateResume", multipartFile);
        });
    }

    @Test
    void validateResume_nullContentType_throwsException() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1 * 1024 * 1024L);
        when(multipartFile.getContentType()).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () -> {
            ReflectionTestUtils.invokeMethod(cloudinaryUtil, "validateResume", multipartFile);
        });
    }

    @Test
    void uploadResume_success() throws IOException {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1 * 1024 * 1024L);
        when(multipartFile.getContentType()).thenReturn("application/pdf");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});

        doReturn(cloudinary).when(cloudinaryUtil).getCloudinary();
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(Map.of("secure_url", "http://test-url.pdf"));

        String url = cloudinaryUtil.uploadResume(multipartFile);

        assertEquals("http://test-url.pdf", url);
    }
    
    @Test
    void validateResume_empty_throwsException() {
        when(multipartFile.isEmpty()).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> {
            ReflectionTestUtils.invokeMethod(cloudinaryUtil, "validateResume", multipartFile);
        });
    }

    @Test
    void getCloudinary_coverage() {
        // Just call it to cover the lines
        assertNotNull(cloudinaryUtil.getCloudinary());
    }
}
