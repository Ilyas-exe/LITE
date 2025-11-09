package com.lite.lite_backend.repository;

import com.lite.lite_backend.entity.Note;
import com.lite.lite_backend.entity.User;
import com.lite.lite_backend.entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUser(User user);

    List<Note> findByUserAndFolder(User user, Folder folder);
}
