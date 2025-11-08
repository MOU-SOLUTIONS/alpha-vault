/**
 * ================================================================
 *  Coded by Mohamed Dhaoui for Alpha Vault - Financial System
 *  Service: FileStorageService - handles file upload and storage
 * ================================================================
 */
package com.alpha.alphavault.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${server.servlet.context-path:}")
    private String contextPath;

    @Value("${server.port:8080}")
    private String serverPort;

    /**
     * Saves a profile image file and returns the URL to access it.
     * 
     * @param file The image file to save
     * @param userId The user ID for naming the file
     * @return The URL path to access the saved file
     * @throws IOException if file cannot be saved
     * @throws IllegalArgumentException if file is invalid
     */
    public String saveProfileImage(MultipartFile file, Long userId) throws IOException {
        // Validate file
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required and cannot be empty");
        }

        // Validate file type (only images)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed. Received: " + contentType);
        }

        // Validate file size (max 10MB)
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 10MB");
        }

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, "profile-images");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("Created upload directory: {}", uploadPath.toAbsolutePath());
        }

        // Generate unique filename: user-{userId}-{timestamp}-{uuid}.{extension}
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String uniqueFilename = String.format("user-%d-%d-%s%s", 
            userId, 
            System.currentTimeMillis(), 
            UUID.randomUUID().toString().substring(0, 8),
            extension);

        // Save file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        log.info("File saved successfully: {}", filePath.toAbsolutePath());

        // Generate URL path
        String urlPath = String.format("/api/files/profile-images/%s", uniqueFilename);
        return urlPath;
    }

    /**
     * Deletes a profile image file.
     * 
     * @param fileUrl The URL path of the file to delete
     * @return true if file was deleted, false if file doesn't exist
     */
    public boolean deleteProfileImage(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return false;
        }

        try {
            // Extract filename from URL
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir, "profile-images", filename);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted successfully: {}", filePath.toAbsolutePath());
                return true;
            }
            return false;
        } catch (IOException e) {
            log.error("Error deleting file: {}", fileUrl, e);
            return false;
        }
    }

    /**
     * Gets the absolute path to the upload directory.
     */
    public String getUploadDirectory() {
        return Paths.get(uploadDir).toAbsolutePath().toString();
    }
}

