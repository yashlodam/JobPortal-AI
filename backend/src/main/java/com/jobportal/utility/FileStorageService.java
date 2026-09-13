package com.jobportal.utility;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/**
 * Abstraction for file storage operations.
 * Supports hybrid local disk cache + persistent database backing.
 */
public interface FileStorageService {

    /**
     * Stores a file and returns its relative URL path.
     *
     * @param file    the multipart file to store
     * @param subDir  subdirectory within the upload base (e.g., "profile", "logo", "resume")
     * @return relative URL path suitable for serving (e.g., "profile/uuid_filename.jpg")
     */
    String store(MultipartFile file, String subDir) throws Exception;

    /**
     * Deletes a previously stored file by its relative path.
     */
    void delete(String relativePath);

    /**
     * Loads a file as a Spring Resource. If missing from local disk (e.g. after container restart),
     * recovers from database backing store and restores to disk cache.
     */
    Resource loadAsResource(String relativePath) throws Exception;

    /**
     * Determines the content type of the file.
     */
    String getContentType(String relativePath);
}
