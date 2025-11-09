package com.lite.lite_backend.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class FolderTreeDTO {
    private Long id;
    private String name;
    private String type = "folder";
    private List<FolderTreeDTO> subFolders = new ArrayList<>();
    private List<NoteTreeDTO> notes = new ArrayList<>();
    private List<DocumentTreeDTO> documents = new ArrayList<>();
}
