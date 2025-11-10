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

        // Get original filename
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            originalFilename = "document";
        }

        // Determine folder based on file type
        String folder = "lite-app/documents";
        if (originalFilename.endsWith(".pdf") ||
                originalFilename.endsWith(".doc") ||
                originalFilename.endsWith(".docx")) {
            folder = "lite-app/cvs";
        }

        // Clean the filename - keep extension for public_id
        String cleanFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");

        // Upload to Cloudinary with proper configuration
        Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "raw", // Use 'raw' for PDFs and documents
                        "public_id", cleanFilename, // Just the filename without folder (folder param handles that)
                        "use_filename", true,
                        "unique_filename", false, // Keep original name
                        "overwrite", true, // Allow overwriting
                        "invalidate", true // Invalidate CDN cache
                ));

        // Return the secure URL of the uploaded file
        String secureUrl = (String) uploadResult.get("secure_url");

        // Log for debugging
        System.out.println("File uploaded successfully to Cloudinary: " + secureUrl);

        return secureUrl;
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
