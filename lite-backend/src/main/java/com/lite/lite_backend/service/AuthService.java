package com.lite.lite_backend.service;

import com.lite.lite_backend.dto.AuthResponse;
import com.lite.lite_backend.dto.LoginRequest;
import com.lite.lite_backend.dto.RegisterRequest;
import com.lite.lite_backend.entity.User;
import com.lite.lite_backend.repository.UserRepository;
import com.lite.lite_backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    /**
     * Register a new user
     * - Check if email already exists
     * - Hash the password
     * - Save the user
     * - Generate and return a JWT token
     */
    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Save user to database
        userRepository.save(user);

        // Generate JWT token
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        // Return response
        return new AuthResponse(token, user.getName());
    }

    /**
     * Login a user
     * - Authenticate the credentials
     * - Generate and return a JWT token
     */
    public AuthResponse login(LoginRequest request) {
        // Authenticate the user (this will throw an exception if credentials are wrong)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // If we reach here, authentication was successful
        // Load user details and generate token
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        // Get user name from database
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Return response
        return new AuthResponse(token, user.getName());
    }
}
