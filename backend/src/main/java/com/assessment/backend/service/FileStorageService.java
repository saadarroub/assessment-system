package com.assessment.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Service for handling file storage operations, specifically for user avatars.
 */
@Service
public class FileStorageService {

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
        "image/jpeg",
        "image/png",
        "image/jpg"
    );

    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
    private static final String DEFAULT_AVATAR = "default-avatar.jpg";

    private final Path avatarStorageLocation;

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.avatarStorageLocation = Paths.get(uploadDir).resolve("avatars").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.avatarStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory for file uploads: " + this.avatarStorageLocation, ex);
        }
    }

    /**
     * Store an avatar file for a user.
     *
     * @param file the uploaded file
     * @param userId the user's ID (used for unique naming)
     * @return the stored file name
     * @throws IllegalArgumentException if the file is invalid
     * @throws IOException if storing fails
     */
    public String storeAvatar(MultipartFile file, UUID userId) throws IOException {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String newFilename = userId.toString() + "_" + System.currentTimeMillis() + extension;

        Path targetLocation = this.avatarStorageLocation.resolve(newFilename);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
        }

        return newFilename;
    }

    /**
     * Delete an avatar file.
     *
     * @param filename the file name to delete
     * @return true if deleted, false if file didn't exist
     */
    public boolean deleteAvatar(String filename) {
        if (filename == null || filename.equals(DEFAULT_AVATAR)) {
            return false; // Don't delete the default avatar
        }

        try {
            Path filePath = this.avatarStorageLocation.resolve(filename).normalize();
            return Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            return false;
        }
    }

    /**
     * Get the path to an avatar file.
     *
     * @param filename the file name
     * @return the Path to the file
     */
    public Path getAvatarPath(String filename) {
        if (filename == null || filename.equals(DEFAULT_AVATAR)) {
            // Return path to default avatar in classpath resources
            return null; // Will be handled specially in controller
        }
        return this.avatarStorageLocation.resolve(filename).normalize();
    }

    /**
     * Check if a file exists.
     *
     * @param filename the file name
     * @return true if exists
     */
    public boolean avatarExists(String filename) {
        if (filename == null || filename.equals(DEFAULT_AVATAR)) {
            return true; // Default avatar always "exists"
        }
        Path filePath = this.avatarStorageLocation.resolve(filename).normalize();
        return Files.exists(filePath);
    }

    /**
     * Get the default avatar filename.
     *
     * @return the default avatar filename
     */
    public String getDefaultAvatarFilename() {
        return DEFAULT_AVATAR;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Keine Datei ausgewählt");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Die Datei ist zu groß. Maximale Größe: 2 MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Ungültiges Dateiformat. Nur JPEG und PNG Bilder sind erlaubt");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg"; // Default extension
        }
        return filename.substring(filename.lastIndexOf(".")).toLowerCase();
    }
}
