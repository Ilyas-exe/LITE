package com.lite.lite_backend.service;

import com.lite.lite_backend.dto.UserProfileDTO;
import com.lite.lite_backend.entity.User;
import com.lite.lite_backend.repository.UserRepository;
import com.lite.lite_backend.repository.JobApplicationRepository;
import com.lite.lite_backend.repository.TaskRepository;
import com.lite.lite_backend.repository.NoteRepository;
import com.lite.lite_backend.repository.FolderRepository;
import com.lite.lite_backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final TaskRepository taskRepository;
    private final NoteRepository noteRepository;
    private final FolderRepository folderRepository;
    private final DocumentRepository documentRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get the currently logged-in user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    /**
     * Get user profile information
     */
    public UserProfileDTO getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserProfileDTO(user.getName(), user.getEmail());
    }

    /**
     * Update user profile (name and email)
     */
    @Transactional
    public UserProfileDTO updateUserProfile(String currentEmail, UserProfileDTO profileDTO) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update name (no uniqueness check needed for name)
        user.setName(profileDTO.getUsername());

        // Check if new email is already taken (if different from current)
        if (!user.getEmail().equals(profileDTO.getEmail())) {
            if (userRepository.findByEmail(profileDTO.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(profileDTO.getEmail());
        }

        User updated = userRepository.save(user);
        return new UserProfileDTO(updated.getName(), updated.getEmail());
    }

    /**
     * Change user password
     */
    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update to new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Delete user account and all associated data
     */
    @Transactional
    public void deleteUserAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete all user data (cascade should handle this, but explicit for safety)
        jobApplicationRepository.findByUser(user).forEach(jobApplicationRepository::delete);
        taskRepository.findByUser(user).forEach(taskRepository::delete);
        noteRepository.findByUser(user).forEach(noteRepository::delete);
        folderRepository.findByUser(user).forEach(folderRepository::delete);
        documentRepository.findByUser(user).forEach(documentRepository::delete);

        // Delete the user
        userRepository.delete(user);
    }
}
