package com.lite.lite_backend.dto;

import lombok.Data;

@Data
public class NoteDTO {
    private Long id;
    private String title;
    private String content;
    private Long folderId;
}
