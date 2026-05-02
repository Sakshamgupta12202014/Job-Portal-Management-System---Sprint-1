package com.capg.jobportal.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import org.springframework.web.bind.annotation.RequestParam;
import com.capg.jobportal.dto.UserResponse;
import com.capg.jobportal.dto.PagedResponse;

import java.util.List;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {

	@GetMapping("/api/internal/users")
    List<UserResponse> getAllUsers();

    @GetMapping("/api/internal/users/paged")
    PagedResponse<UserResponse> getAllUsersPaged(@RequestParam("page") int page, @RequestParam("size") int size);
 
    @DeleteMapping("/api/internal/users/{id}")
    void deleteUser(@PathVariable Long id);
 
    @PutMapping("/api/internal/users/{id}/ban")
    void banUser(@PathVariable Long id);
 
    @PutMapping("/api/internal/users/{id}/unban")
    void unbanUser(@PathVariable Long id);
 
    @PutMapping("/api/internal/users/{id}/invalidate-token")
    void invalidateToken(@PathVariable Long id);
}
