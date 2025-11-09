package com.lite.lite_backend.repository;

import com.lite.lite_backend.entity.Note;
import com.lite.lite_backend.entity.NoteVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteVersionRepository extends JpaRepository<NoteVersion, Long> {
    List<NoteVersion> findByNoteOrderByVersionNumberDesc(Note note);

    int countByNote(Note note);
}
