package com.lite.lite_backend.dto;

import lombok.Data;

@Data
public class NoteTreeDTO {
    private Long id;
    private String title;
    private String type = "note";
}
