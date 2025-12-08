package com.assessment.backend.controller;

import com.assessment.backend.service.FileStorageService;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Controller for serving avatar files.
 */
@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * Get an avatar image by filename.
     * Returns the default avatar if filename is "default.png" or if the file doesn't exist.
     *
     * @param filename the avatar filename
     * @return the image file
     */
    @GetMapping("/avatars/{filename:.+}")
    public ResponseEntity<Resource> getAvatar(@PathVariable String filename) {
        try {
            Resource resource;
            String contentType = "image/png";

            // Check if it's the default avatar or if the file doesn't exist
            if (filename == null || filename.equals("default-avatar.jpg") || 
                !fileStorageService.avatarExists(filename)) {
                // Return default avatar from classpath
                resource = new ClassPathResource("static/images/default-avatar.jpg");
                if (!resource.exists()) {
                    return ResponseEntity.notFound().build();
                }
            } else {
                // Return the stored avatar
                Path filePath = fileStorageService.getAvatarPath(filename);
                if (filePath == null) {
                    resource = new ClassPathResource("static/images/default-avatar.jpg");
                } else {
                    resource = new UrlResource(filePath.toUri());
                    if (!resource.exists() || !resource.isReadable()) {
                        resource = new ClassPathResource("static/images/default-avatar.jpg");
                    } else {
                        // Determine content type from file
                        contentType = determineContentType(filename);
                    }
                }
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                    .body(resource);

        } catch (MalformedURLException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String determineContentType(String filename) {
        if (filename == null) {
            return "image/png";
        }
        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerFilename.endsWith(".png")) {
            return "image/png";
        }
        return "application/octet-stream";
    }
}
