package com.lite.lite_backend.repository;

import com.lite.lite_backend.entity.Folder;
import com.lite.lite_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByUser(User user);

    List<Folder> findByUserAndParentFolderIsNull(User user);

    List<Folder> findByUserAndParentFolder(User user, Folder parentFolder);
}
