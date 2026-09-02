package lk.maga.procapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.io.InvalidObjectException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path storageDir;

    public FileStorageService(@Value("${app.storage.attachments-dir}") String attachmentsDir) {
        this.storageDir = Paths.get(attachmentsDir);
        try {
            Files.createDirectories(this.storageDir);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create attachments directory: " + attachmentsDir, e);
        }
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No file provided");
        }
        String original = file.getOriginalFilename();
        String extension = "";
        if (original != null && original.contains(".")) {
            extension = original.substring(original.lastIndexOf('.'));
        }
        String storedKey = UUID.randomUUID() + extension;
        Path target = storageDir.resolve(storedKey);

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file");

        }

        return storedKey;
    }

    public Path resolve(String storedKey) {
        Path resolved = storageDir.resolve(storedKey).normalize();
        if (!resolved.startsWith(storageDir)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file reference");
        }
        if (!Files.exists(resolved)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found on disk");

        }
        return resolved;
    }
    
}
