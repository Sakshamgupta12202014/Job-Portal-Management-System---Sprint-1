package com.capg.jobportal.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import java.util.Map;

@RestController
public class FallbackController {

    @GetMapping("/fallback/auth")
    public Mono<ResponseEntity<Map<String, String>>> authFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("message", "Auth Service is temporarily unavailable. Please try again later.")));
    }

    @GetMapping("/fallback/job")
    public Mono<ResponseEntity<Map<String, String>>> jobFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("message", "Job Service is temporarily unavailable. Please try again later.")));
    }

    @GetMapping("/fallback/application")
    public Mono<ResponseEntity<Map<String, String>>> applicationFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("message", "Application Service is temporarily unavailable. Please try again later.")));
    }

    @GetMapping("/fallback/admin")
    public Mono<ResponseEntity<Map<String, String>>> adminFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("message", "Admin Service is temporarily unavailable. Please try again later.")));
    }

    @GetMapping("/fallback/notification")
    public Mono<ResponseEntity<Map<String, String>>> notificationFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("message", "Notification Service is temporarily unavailable. Please try again later.")));
    }
}
