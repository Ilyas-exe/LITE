package com.lite.lite_backend.controller;

import com.lite.lite_backend.dto.PasswordChangeRequest;
import com.lite.lite_backend.dto.UserProfileDTO;
import com.lite.lite_backend.entity.User;
import com.lite.lite_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Get current user profile
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getProfile(Authentication authentication) {
        String email = authentication.getName();
        UserProfileDTO profile = userService.getUserProfile(email);
        return ResponseEntity.ok(profile);
    }

    /**
     * Update user profile (name and email)
     */
    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateProfile(
            @RequestBody UserProfileDTO profileDTO,
            Authentication authentication) {
        String email = authentication.getName();
        UserProfileDTO updated = userService.updateUserProfile(email, profileDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * Change user password
     */
    @PutMapping("/password")
    public ResponseEntity<String> changePassword(
            @RequestBody PasswordChangeRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        userService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok("Password changed successfully");
    }

    /**
     * Delete user account and all associated data
     */
    @DeleteMapping("/account")
    public ResponseEntity<String> deleteAccount(Authentication authentication) {
        String email = authentication.getName();
        userService.deleteUserAccount(email);
        return ResponseEntity.ok("Account deleted successfully");
    }
}
