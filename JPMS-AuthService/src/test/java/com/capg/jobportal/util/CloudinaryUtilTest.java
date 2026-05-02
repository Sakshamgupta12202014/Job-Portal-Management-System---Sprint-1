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
    void uploadProfilePicture_success() throws IOException {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1 * 1024 * 1024L);
        when(multipartFile.getContentType()).thenReturn("image/jpeg");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});

        doReturn(cloudinary).when(cloudinaryUtil).getCloudinary();
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(Map.of("secure_url", "http://test-url.jpg"));

        String url = cloudinaryUtil.uploadProfilePicture(multipartFile);

        assertEquals("http://test-url.jpg", url);
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
    void validateImage_failure_tooLarge() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(3 * 1024 * 1024L);

        assertThrows(IllegalArgumentException.class, () -> {
            ReflectionTestUtils.invokeMethod(cloudinaryUtil, "validateImage", multipartFile);
        });
    }

    @Test
    void validateImage_failure_wrongType() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1 * 1024 * 1024L);
        when(multipartFile.getContentType()).thenReturn("text/plain");

        assertThrows(IllegalArgumentException.class, () -> {
            ReflectionTestUtils.invokeMethod(cloudinaryUtil, "validateImage", multipartFile);
        });
    }

    @Test
    void validateResume_failure_tooLarge() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(6 * 1024 * 1024L);

        assertThrows(IllegalArgumentException.class, () -> {
            ReflectionTestUtils.invokeMethod(cloudinaryUtil, "validateResume", multipartFile);
        });
    }

    @Test
    void validateResume_failure_wrongType() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1 * 1024 * 1024L);
        when(multipartFile.getContentType()).thenReturn("image/jpeg");

        assertThrows(IllegalArgumentException.class, () -> {
            ReflectionTestUtils.invokeMethod(cloudinaryUtil, "validateResume", multipartFile);
        });
    }

    @Test
    void validateImage_failure_nullFile() {
        assertThrows(IllegalArgumentException.class, () -> {
            ReflectionTestUtils.invokeMethod(cloudinaryUtil, "validateImage", (Object) null);
        });
    }

    @Test
    void validateImage_failure_emptyFile() {
        when(multipartFile.isEmpty()).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> {
            ReflectionTestUtils.invokeMethod(cloudinaryUtil, "validateImage", multipartFile);
        });
    }

    @Test
    void validateImage_failure_nullContentType() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1 * 1024 * 1024L);
        when(multipartFile.getContentType()).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () -> {
            ReflectionTestUtils.invokeMethod(cloudinaryUtil, "validateImage", multipartFile);
        });
    }

    @Test
    void validateResume_failure_nullFile() {
        assertThrows(IllegalArgumentException.class, () -> {
            ReflectionTestUtils.invokeMethod(cloudinaryUtil, "validateResume", (Object) null);
        });
    }

    @Test
    void validateResume_failure_emptyFile() {
        when(multipartFile.isEmpty()).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> {
            ReflectionTestUtils.invokeMethod(cloudinaryUtil, "validateResume", multipartFile);
        });
    }

    @Test
    void validateResume_failure_nullContentType() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1 * 1024 * 1024L);
        when(multipartFile.getContentType()).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () -> {
            ReflectionTestUtils.invokeMethod(cloudinaryUtil, "validateResume", multipartFile);
        });
    }

    @Test
    void getCloudinary_returnsInstance() {
        Cloudinary instance = cloudinaryUtil.getCloudinary();
        assertNotNull(instance);
    }

    @Test
    void validateImage_success_png() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1 * 1024 * 1024L);
        when(multipartFile.getContentType()).thenReturn("image/png");

        assertDoesNotThrow(() -> {
            ReflectionTestUtils.invokeMethod(cloudinaryUtil, "validateImage", multipartFile);
        });
    }
}
