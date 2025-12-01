package com.assessment.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HierarchyNodeDto {
    private String name;
    private Long size;
    private List<HierarchyNodeDto> children;
    
    // Constructor for leaf nodes
    public HierarchyNodeDto(String name, Long size) {
        this.name = name;
        this.size = size;
    }
}
