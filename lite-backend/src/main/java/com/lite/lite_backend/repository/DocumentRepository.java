package com.lite.lite_backend.repository;

import com.lite.lite_backend.entity.Document;
import com.lite.lite_backend.entity.User;
import com.lite.lite_backend.entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUser(User user);

    List<Document> findByUserAndFolder(User user, Folder folder);
}
