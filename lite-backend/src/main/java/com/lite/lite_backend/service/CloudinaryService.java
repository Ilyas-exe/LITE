package com.lite.lite_backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Constructor - initializes Cloudinary with credentials from
     * application.properties
     */
    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret));
    }

    /**
     * Upload a file to Cloudinary and return the URL
     * 
     * @param file The file to upload
     * @return The URL of the uploaded file
     * @throws IOException if upload fails
     */
    public String uploadFile(MultipartFile file) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Upload to Cloudinary
        Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "lite-app/cvs", // Organize files in a folder
                        "resource_type", "auto", // Auto-detect file type
                        "type", "upload", // Make it publicly accessible
                        "access_mode", "public" // Public access mode
                ));

        // Return the secure URL of the uploaded file
        return (String) uploadResult.get("secure_url");
    }

    /**
     * Delete a file from Cloudinary
     * 
     * @param publicId The public ID of the file (extracted from URL)
     * @throws IOException if deletion fails
     */
    public void deleteFile(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
