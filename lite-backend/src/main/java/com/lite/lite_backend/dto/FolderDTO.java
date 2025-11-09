package com.lite.lite_backend.dto;

import lombok.Data;

@Data
public class FolderDTO {
    private Long id;
    private String name;
    private Long parentFolderId;
}
