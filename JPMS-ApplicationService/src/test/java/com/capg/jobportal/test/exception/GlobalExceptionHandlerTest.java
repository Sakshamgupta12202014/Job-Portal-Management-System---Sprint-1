package com.capg.jobportal.test.exception;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.capg.jobportal.dto.ErrorResponse;
import com.capg.jobportal.exception.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleNotFound() {
        ResponseEntity<ErrorResponse> response = handler.handleNotFound(new ResourceNotFoundException("Not found"));
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Not found", response.getBody().getMessage());
    }

    @Test
    void handleForbidden() {
        ResponseEntity<ErrorResponse> response = handler.handleForbidden(new ForbiddenException("Forbidden"));
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void handleDuplicate() {
        ResponseEntity<ErrorResponse> response = handler.handleDuplicate(new DuplicateApplicationException("Duplicate"));
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    void handleInvalidTransition() {
        ResponseEntity<ErrorResponse> response = handler.handleInvalidTransition(new InvalidStatusTransitionException("Invalid"));
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void handleFileTooLarge() {
        ResponseEntity<ErrorResponse> response = handler.handleFileTooLarge(new MaxUploadSizeExceededException(5000L));
        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE, response.getStatusCode());
    }

    @Test
    void handleBadInput() {
        ResponseEntity<ErrorResponse> response = handler.handleBadInput(new IllegalArgumentException("Bad input"));
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void handleGeneral() {
        ResponseEntity<ErrorResponse> response = handler.handleGeneral(new Exception("General error"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void handleValidation() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult br = mock(BindingResult.class);
        FieldError fe1 = new FieldError("obj", "field1", "msg1");
        FieldError fe2 = new FieldError("obj", "field2", "msg2");
        
        when(ex.getBindingResult()).thenReturn(br);
        when(br.getFieldErrors()).thenReturn(Arrays.asList(fe1, fe2));
        
        ResponseEntity<ErrorResponse> response = handler.handleValidation(ex);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().getMessage().contains("msg1"));
        assertTrue(response.getBody().getMessage().contains("msg2"));
    }
}
