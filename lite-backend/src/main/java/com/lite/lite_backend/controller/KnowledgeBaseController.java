package com.lite.lite_backend.controller;

import com.lite.lite_backend.dto.*;
import com.lite.lite_backend.entity.*;
import com.lite.lite_backend.repository.*;
import com.lite.lite_backend.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/kb")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class KnowledgeBaseController {

    private final FolderRepository folderRepository;
    private final NoteRepository noteRepository;
    private final DocumentRepository documentRepository;
    private final NoteVersionRepository noteVersionRepository;
    private final CloudinaryService cloudinaryService;

    // GET /api/kb/tree - Get the entire file/folder tree
    @GetMapping("/tree")
    public ResponseEntity<FolderTreeDTO> getTree(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;

        // Create a virtual root to hold everything
        FolderTreeDTO root = new FolderTreeDTO();
        root.setId(null);
        root.setName("Root");

        // Get all root folders
        List<Folder> rootFolders = folderRepository.findByUserAndParentFolderIsNull(user);
        List<FolderTreeDTO> folderDTOs = rootFolders.stream()
                .map(this::buildFolderTree)
                .collect(Collectors.toList());
        root.setSubFolders(folderDTOs);

        // Get root-level notes (notes without a folder)
        List<Note> rootNotes = noteRepository.findByUserAndFolder(user, null);
        List<NoteTreeDTO> noteDTOs = rootNotes.stream()
                .map(note -> {
                    NoteTreeDTO noteDto = new NoteTreeDTO();
                    noteDto.setId(note.getId());
                    noteDto.setTitle(note.getTitle());
                    return noteDto;
                })
                .collect(Collectors.toList());
        root.setNotes(noteDTOs);

        // Get root-level documents (documents without a folder)
        List<Document> rootDocuments = documentRepository.findByUserAndFolder(user, null);
        List<DocumentTreeDTO> docDTOs = rootDocuments.stream()
                .map(doc -> {
                    DocumentTreeDTO docDto = new DocumentTreeDTO();
                    docDto.setId(doc.getId());
                    docDto.setFileName(doc.getFileName());
                    docDto.setDocumentUrl(doc.getDocumentUrl());
                    return docDto;
                })
                .collect(Collectors.toList());
        root.setDocuments(docDTOs);

        return ResponseEntity.ok(root);
    }

    // Recursive method to build folder tree
    private FolderTreeDTO buildFolderTree(Folder folder) {
        FolderTreeDTO dto = new FolderTreeDTO();
        dto.setId(folder.getId());
        dto.setName(folder.getName());

        // Add subfolders
        List<FolderTreeDTO> subFolders = folder.getSubFolders().stream()
                .map(this::buildFolderTree)
                .collect(Collectors.toList());
        dto.setSubFolders(subFolders);

        // Add notes
        List<NoteTreeDTO> notes = folder.getNotes().stream()
                .map(note -> {
                    NoteTreeDTO noteDto = new NoteTreeDTO();
                    noteDto.setId(note.getId());
                    noteDto.setTitle(note.getTitle());
                    return noteDto;
                })
                .collect(Collectors.toList());
        dto.setNotes(notes);

        // Add documents
        List<DocumentTreeDTO> documents = folder.getDocuments().stream()
                .map(doc -> {
                    DocumentTreeDTO docDto = new DocumentTreeDTO();
                    docDto.setId(doc.getId());
                    docDto.setFileName(doc.getFileName());
                    docDto.setDocumentUrl(doc.getDocumentUrl());
                    return docDto;
                })
                .collect(Collectors.toList());
        dto.setDocuments(documents);

        return dto;
    }

    // GET /api/notes/{id} - Get a single note
    @GetMapping("/notes/{id}")
    public ResponseEntity<NoteDTO> getNote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!note.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        NoteDTO dto = new NoteDTO();
        dto.setId(note.getId());
        dto.setTitle(note.getTitle());
        dto.setContent(note.getContent());
        dto.setFolderId(note.getFolder() != null ? note.getFolder().getId() : null);

        return ResponseEntity.ok(dto);
    }

    // PUT /api/notes/{id} - Update note content
    @PutMapping("/notes/{id}")
    public ResponseEntity<NoteDTO> updateNote(
            @PathVariable Long id,
            @RequestBody NoteDTO noteDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!note.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Save current version before updating
        if (note.getContent() != null && !note.getContent().equals(noteDTO.getContent())) {
            NoteVersion version = new NoteVersion();
            version.setNote(note);
            version.setTitle(note.getTitle());
            version.setContent(note.getContent());
            version.setVersionNumber(noteVersionRepository.countByNote(note) + 1);
            noteVersionRepository.save(version);
        }

        note.setTitle(noteDTO.getTitle());
        note.setContent(noteDTO.getContent());

        // Update folder association (allow moving between folders)
        if (noteDTO.getFolderId() != null) {
            Folder folder = folderRepository.findById(noteDTO.getFolderId())
                    .orElseThrow(() -> new RuntimeException("Folder not found"));
            if (!folder.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            note.setFolder(folder);
        } else {
            // Allow moving to root (no folder)
            note.setFolder(null);
        }

        Note savedNote = noteRepository.save(note);

        NoteDTO responseDto = new NoteDTO();
        responseDto.setId(savedNote.getId());
        responseDto.setTitle(savedNote.getTitle());
        responseDto.setContent(savedNote.getContent());
        responseDto.setFolderId(savedNote.getFolder() != null ? savedNote.getFolder().getId() : null);

        return ResponseEntity.ok(responseDto);
    }

    // POST /api/kb/upload-document - Upload a document
    @PostMapping("/upload-document")
    public ResponseEntity<DocumentTreeDTO> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folderId", required = false) Long folderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;

            String documentUrl = cloudinaryService.uploadFile(file);

            Document document = new Document();
            document.setFileName(file.getOriginalFilename());
            document.setDocumentUrl(documentUrl);
            document.setUser(user);

            if (folderId != null) {
                Folder folder = folderRepository.findById(folderId)
                        .orElseThrow(() -> new RuntimeException("Folder not found"));
                if (!folder.getUser().getId().equals(user.getId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
                document.setFolder(folder);
            }

            Document savedDocument = documentRepository.save(document);

            DocumentTreeDTO dto = new DocumentTreeDTO();
            dto.setId(savedDocument.getId());
            dto.setFileName(savedDocument.getFileName());
            dto.setDocumentUrl(savedDocument.getDocumentUrl());

            return new ResponseEntity<>(dto, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET /api/kb/folders/{id} - Get folder contents
    @GetMapping("/folders/{id}")
    public ResponseEntity<FolderTreeDTO> getFolderContents(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        Folder folder = folderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        if (!folder.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        FolderTreeDTO dto = buildFolderTree(folder);
        return ResponseEntity.ok(dto);
    }

    // POST /api/kb/folders - Create a folder
    @PostMapping("/folders")
    public ResponseEntity<FolderDTO> createFolder(
            @RequestBody FolderDTO folderDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;

        Folder folder = new Folder();
        folder.setName(folderDTO.getName());
        folder.setUser(user);

        if (folderDTO.getParentFolderId() != null) {
            Folder parentFolder = folderRepository.findById(folderDTO.getParentFolderId())
                    .orElseThrow(() -> new RuntimeException("Parent folder not found"));
            if (!parentFolder.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            folder.setParentFolder(parentFolder);
        }

        Folder savedFolder = folderRepository.save(folder);

        FolderDTO responseDto = new FolderDTO();
        responseDto.setId(savedFolder.getId());
        responseDto.setName(savedFolder.getName());
        responseDto.setParentFolderId(
                savedFolder.getParentFolder() != null ? savedFolder.getParentFolder().getId() : null);

        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    // DELETE /api/kb/folders/{id} - Delete a folder
    @DeleteMapping("/folders/{id}")
    public ResponseEntity<Void> deleteFolder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        Folder folder = folderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        if (!folder.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        folderRepository.delete(folder);
        return ResponseEntity.noContent().build();
    }

    // POST /api/kb/notes - Create a note
    @PostMapping("/notes")
    public ResponseEntity<NoteDTO> createNote(
            @RequestBody NoteDTO noteDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;

        Note note = new Note();
        note.setTitle(noteDTO.getTitle());
        note.setContent(noteDTO.getContent());
        note.setUser(user);

        if (noteDTO.getFolderId() != null) {
            Folder folder = folderRepository.findById(noteDTO.getFolderId())
                    .orElseThrow(() -> new RuntimeException("Folder not found"));
            if (!folder.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            note.setFolder(folder);
        }

        Note savedNote = noteRepository.save(note);

        NoteDTO responseDto = new NoteDTO();
        responseDto.setId(savedNote.getId());
        responseDto.setTitle(savedNote.getTitle());
        responseDto.setContent(savedNote.getContent());
        responseDto.setFolderId(savedNote.getFolder() != null ? savedNote.getFolder().getId() : null);

        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    // DELETE /api/kb/notes/{id} - Delete a note
    @DeleteMapping("/notes/{id}")
    public ResponseEntity<Void> deleteNote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!note.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        noteRepository.delete(note);
        return ResponseEntity.noContent().build();
    }

    // PUT /api/kb/documents/{id} - Update document folder (move document)
    @PutMapping("/documents/{id}")
    public ResponseEntity<DocumentTreeDTO> updateDocument(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!document.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Update folder association (allow moving between folders)
        Long folderId = body.get("folderId");
        if (folderId != null) {
            Folder folder = folderRepository.findById(folderId)
                    .orElseThrow(() -> new RuntimeException("Folder not found"));
            if (!folder.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            document.setFolder(folder);
        } else {
            // Allow moving to root (no folder)
            document.setFolder(null);
        }

        Document savedDocument = documentRepository.save(document);

        DocumentTreeDTO responseDto = new DocumentTreeDTO();
        responseDto.setId(savedDocument.getId());
        responseDto.setFileName(savedDocument.getFileName());
        responseDto.setDocumentUrl(savedDocument.getDocumentUrl());

        return ResponseEntity.ok(responseDto);
    }

    // DELETE /api/kb/documents/{id} - Delete a document
    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!document.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        documentRepository.delete(document);
        return ResponseEntity.noContent().build();
    }

    // GET /api/kb/search?q={query} - Search notes and documents
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchKnowledgeBase(
            @RequestParam String q,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;

        String lowerQuery = q.toLowerCase();

        // Search notes
        List<Note> allNotes = noteRepository.findByUser(user);
        List<Map<String, Object>> matchingNotes = allNotes.stream()
                .filter(note -> (note.getTitle() != null && note.getTitle().toLowerCase().contains(lowerQuery)) ||
                        (note.getContent() != null && note.getContent().toLowerCase().contains(lowerQuery)))
                .map(note -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", note.getId());
                    map.put("title", note.getTitle());
                    map.put("type", "note");
                    return map;
                })
                .collect(Collectors.toList());

        // Search documents
        List<Document> allDocuments = documentRepository.findByUser(user);
        List<Map<String, Object>> matchingDocuments = allDocuments.stream()
                .filter(doc -> doc.getFileName() != null && doc.getFileName().toLowerCase().contains(lowerQuery))
                .map(doc -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", doc.getId());
                    map.put("fileName", doc.getFileName());
                    map.put("type", "document");
                    return map;
                })
                .collect(Collectors.toList());

        Map<String, Object> results = new HashMap<>();
        results.put("notes", matchingNotes);
        results.put("documents", matchingDocuments);

        return ResponseEntity.ok(results);
    }

    // GET /api/kb/notes/{id}/versions - Get version history
    @GetMapping("/notes/{id}/versions")
    public ResponseEntity<List<Map<String, Object>>> getNoteVersions(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!note.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<NoteVersion> versions = noteVersionRepository.findByNoteOrderByVersionNumberDesc(note);
        List<Map<String, Object>> versionList = versions.stream()
                .map(v -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", v.getId());
                    map.put("versionNumber", v.getVersionNumber());
                    map.put("title", v.getTitle());
                    map.put("content", v.getContent());
                    map.put("createdAt", v.getCreatedAt().toString());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(versionList);
    }

    // POST /api/kb/notes/{id}/restore/{versionId} - Restore a version
    @PostMapping("/notes/{id}/restore/{versionId}")
    public ResponseEntity<NoteDTO> restoreNoteVersion(
            @PathVariable Long id,
            @PathVariable Long versionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!note.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        NoteVersion version = noteVersionRepository.findById(versionId)
                .orElseThrow(() -> new RuntimeException("Version not found"));

        if (!version.getNote().getId().equals(note.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Save current as version before restoring
        NoteVersion currentVersion = new NoteVersion();
        currentVersion.setNote(note);
        currentVersion.setTitle(note.getTitle());
        currentVersion.setContent(note.getContent());
        currentVersion.setVersionNumber(noteVersionRepository.countByNote(note) + 1);
        noteVersionRepository.save(currentVersion);

        // Restore from version
        note.setTitle(version.getTitle());
        note.setContent(version.getContent());
        Note savedNote = noteRepository.save(note);

        NoteDTO responseDto = new NoteDTO();
        responseDto.setId(savedNote.getId());
        responseDto.setTitle(savedNote.getTitle());
        responseDto.setContent(savedNote.getContent());
        responseDto.setFolderId(savedNote.getFolder() != null ? savedNote.getFolder().getId() : null);

        return ResponseEntity.ok(responseDto);
    }
}