package com.capg.jobportal.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.capg.jobportal.dao.UserRepository;
import com.capg.jobportal.dto.AuthResponse;
import com.capg.jobportal.dto.LoginRequest;
import com.capg.jobportal.dto.PagedResponse;
import com.capg.jobportal.dto.RegisterRequest;
import com.capg.jobportal.dto.UpdateProfileRequest;
import com.capg.jobportal.dto.UserProfileResponse;
import com.capg.jobportal.entity.User;
import com.capg.jobportal.enums.Role;
import com.capg.jobportal.enums.UserStatus;
import com.capg.jobportal.exception.ResourceNotFoundException;
import com.capg.jobportal.exception.UserAlreadyExistsException;
import com.capg.jobportal.security.JwtUtil;
import com.capg.jobportal.util.CloudinaryUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


/*
 * ================================================================
 * AUTHOR: Saksham Gupta
 * CLASS: AuthService
 * DESCRIPTION:
 * This service handles all authentication-related operations such as
 * user registration, login, token management, profile updates, and
 * internal admin operations like user deletion and status updates.
 * ================================================================
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CloudinaryUtil cloudinaryUtil;

    /* ================================================================
     * METHOD: register
     * DESCRIPTION:
     * Registers a new user after validating role and checking for
     * duplicate email. Password is securely encoded before saving.
     * ================================================================ */
    public AuthResponse register(RegisterRequest request) {

        log.info("Register request for email: {}", request.getEmail());

        if (request.getRole() == Role.ADMIN) {
            log.warn("Admin registration blocked");
            throw new IllegalArgumentException("Admin registration is not allowed");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Email already exists: {}", request.getEmail());
            throw new UserAlreadyExistsException("Email already in use");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setPhone(request.getPhone());

        User savedUser = userRepository.save(user);

        log.info("User registered successfully: {}", request.getEmail());

        // Automatically generate tokens to log the user in immediately
        String accessToken = jwtUtil.generateAccessToken(savedUser.getId(), savedUser.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken();

        savedUser.setRefreshToken(refreshToken);
        userRepository.save(savedUser);

        return new AuthResponse(accessToken, refreshToken, savedUser.getRole().name(),
                savedUser.getId(), savedUser.getName(), savedUser.getEmail());
    }
    

    /* ================================================================
     * METHOD: login
     * DESCRIPTION:
     * Authenticates user credentials and generates access and refresh
     * tokens if credentials are valid and account is active.
     * ================================================================ */
    public AuthResponse login(LoginRequest request) {
    	log.info("CHECK LOGGER FORMAT");

        log.info("Login attempt for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            log.warn("User not found: {}", request.getEmail());
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (user.getStatus() == UserStatus.BANNED) {
            log.warn("Banned user login attempt: {}", request.getEmail());
            throw new IllegalArgumentException("Account suspended");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Invalid password attempt for: {}", request.getEmail());
            throw new IllegalArgumentException("Invalid credentials");
        }

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken();

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        log.info("Login successful for user ID: {}", user.getId());

        return new AuthResponse(accessToken, refreshToken, user.getRole().name(),
                user.getId(), user.getName(), user.getEmail());
    }
    

    /* ================================================================
     * METHOD: refresh
     * DESCRIPTION:
     * Generates new access and refresh tokens using a valid refresh token.
     * ================================================================ */
    public AuthResponse refresh(String refreshToken) {

        log.debug("Refreshing token");

        User user = userRepository.findByRefreshToken(refreshToken).orElse(null);

        if (user == null) {
            log.warn("Invalid refresh token");
            throw new ResourceNotFoundException("Invalid or expired refresh token");
        }

        if (user.getStatus() == UserStatus.BANNED) {
            log.warn("Banned user token refresh attempt: {}", user.getId());
            throw new IllegalArgumentException("Account suspended");
        }

        String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.getRole().name());
        String newRefreshToken = jwtUtil.generateRefreshToken();

        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        log.info("Token refreshed for user ID: {}", user.getId());

        return new AuthResponse(newAccessToken, newRefreshToken, user.getRole().name(),
                user.getId(), user.getName(), user.getEmail());
    }
    

    /* ================================================================
     * METHOD: logout
     * DESCRIPTION:
     * Logs out user by clearing refresh token from database.
     * ================================================================ */
    public void logout(String refreshToken) {

        log.debug("Logout request");

        User user = userRepository.findByRefreshToken(refreshToken).orElse(null);

        if (user == null) {
            log.warn("Invalid logout token");
            throw new ResourceNotFoundException("Invalid refresh token");
        }

        user.setRefreshToken(null);
        userRepository.save(user);

        log.info("User logged out: {}", user.getId());
    }

    
    /* ================================================================
     * METHOD: updateProfilePicture
     * DESCRIPTION:
     * Uploads user profile picture to cloud storage and updates DB.
     * ================================================================ */
    public String updateProfilePicture(Long userId, MultipartFile picture) throws IOException {

        log.info("Updating profile picture for user: {}", userId);

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User not found: {}", userId);
            throw new ResourceNotFoundException("User not found");
        }

        String url = cloudinaryUtil.uploadProfilePicture(picture);
        user.setProfilePictureUrl(url);
        userRepository.save(user);

        log.info("Profile picture updated for user: {}", userId);

        return url;
    }
    

    /* ================================================================
     * METHOD: removeProfilePicture
     * DESCRIPTION:
     * Deletes the user's profile picture from Cloudinary and clears DB.
     * ================================================================ */
    public void removeProfilePicture(Long userId) throws IOException {

        log.info("Removing profile picture for user: {}", userId);

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }

        if (user.getProfilePictureUrl() != null) {
            cloudinaryUtil.deleteByUrl(user.getProfilePictureUrl(), "image");
            user.setProfilePictureUrl(null);
            userRepository.save(user);
        }

        log.info("Profile picture removed for user: {}", userId);
    }


    /* ================================================================
     * METHOD: removeResume
     * DESCRIPTION:
     * Deletes the user's resume from Cloudinary and clears DB.
     * ================================================================ */
    public void removeResume(Long userId) throws IOException {

        log.info("Removing resume for user: {}", userId);

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }

        if (user.getResumeUrl() != null) {
            cloudinaryUtil.deleteByUrl(user.getResumeUrl(), "raw");
            user.setResumeUrl(null);
            userRepository.save(user);
        }

        log.info("Resume removed for user: {}", userId);
    }


    /* ================================================================
     * METHOD: updateProfileResume
     * DESCRIPTION:
     * Uploads user resume to cloud storage and updates DB.
     * ================================================================ */
    public String updateProfileResume(Long userId, MultipartFile resume) throws IOException {

        log.info("Updating resume for user: {}", userId);

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User not found: {}", userId);
            throw new ResourceNotFoundException("User not found");
        }

        String url = cloudinaryUtil.uploadResume(resume);
        user.setResumeUrl(url);
        userRepository.save(user);

        log.info("Resume updated for user: {}", userId);

        return url;
    }
    

    /* ================================================================
     * METHOD: getProfile
     * DESCRIPTION:
     * Fetches user profile details by user ID.
     * ================================================================ */
    public UserProfileResponse getProfile(Long userId) {

        log.debug("Fetching profile for user: {}", userId);

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User not found: {}", userId);
            throw new ResourceNotFoundException("User not found");
        }

        return UserProfileResponse.fromEntity(user);
    }
    

    /* ================================================================
     * METHOD: updateProfile
     * DESCRIPTION:
     * Updates user personal details such as name, bio, skills, etc.
     * ================================================================ */
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {

        log.info("Update profile request for user: {}", userId);

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User not found: {}", userId);
            throw new ResourceNotFoundException("User not found");
        }

        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getSkills() != null) user.setSkills(request.getSkills());
        if (request.getExperienceYears() != null) user.setExperienceYears(request.getExperienceYears());

        userRepository.save(user);

        log.info("Profile updated successfully for user: {}", userId);

        return UserProfileResponse.fromEntity(user);
    }
    

    /* ================================================================
     * METHOD: getAllUsers
     * DESCRIPTION:
     * Retrieves all users for admin/internal use.
     * ================================================================ */
    public List<UserProfileResponse> getAllUsers() {
        log.debug("Fetching all users");
        List<User> users = userRepository.findAll();
        List<UserProfileResponse> result = new ArrayList<>();
        for (User user : users) {
            result.add(UserProfileResponse.fromEntity(user));
        }
        log.info("Total users fetched: {}", result.size());
        return result;
    }

    public PagedResponse<UserProfileResponse> getAllUsersPaged(int page, int size) {
        log.debug("Fetching paginated users — page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userRepository.findAll(pageable);

        List<UserProfileResponse> content = userPage.getContent().stream()
            .map(UserProfileResponse::fromEntity)
            .collect(Collectors.toList());

        return new PagedResponse<>(
            content,
            userPage.getNumber(),
            userPage.getTotalPages(),
            userPage.getTotalElements(),
            userPage.isLast()
        );
    }
    

    /* ================================================================
     * METHOD: deleteUser
     * DESCRIPTION:
     * Deletes a user by ID (used by admin).
     * ================================================================ */
    public void deleteUser(Long userId) {

        log.info("Deleting user: {}", userId);

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User not found: {}", userId);
            throw new ResourceNotFoundException("User not found");
        }

        userRepository.delete(user);

        log.info("User deleted: {}", userId);
    }

    
    /* ================================================================
     * METHOD: updateUserStatus
     * DESCRIPTION:
     * Updates user status (BAN / UNBAN) and invalidates token.
     * ================================================================ */
    public void updateUserStatus(Long userId, String status) {

        log.info("Updating status for user {} to {}", userId, status);

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User not found: {}", userId);
            throw new ResourceNotFoundException("User not found");
        }

        user.setStatus(UserStatus.valueOf(status));
        user.setRefreshToken(null);

        userRepository.save(user);

        log.info("User status updated successfully");
    }

    
    /* ================================================================
     * METHOD: invalidateTokenByUserId
     * DESCRIPTION:
     * Clears refresh token of user (used after ban).
     * ================================================================ */
    public void invalidateTokenByUserId(Long userId) {

        log.info("Invalidating token for user: {}", userId);

        User user = userRepository.findById(userId).orElse(null);

        if (user != null) {
            user.setRefreshToken(null);
            userRepository.save(user);
            log.info("Token invalidated");
        } else {
            log.warn("User not found for token invalidation");
        }
    }
    
    
    public List<String> getJobSeekerEmails() {
        return userRepository.findByRole(Role.JOB_SEEKER)
                .stream()
                .filter(user -> user.getStatus() == UserStatus.ACTIVE)
                .map(User::getEmail)
                .collect(Collectors.toList());
    }
}