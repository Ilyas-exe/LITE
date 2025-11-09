package com.lite.lite_backend.dto;

import lombok.Data;

@Data
public class DocumentTreeDTO {
    private Long id;
    private String fileName;
    private String documentUrl;
    private String type = "document";
}
