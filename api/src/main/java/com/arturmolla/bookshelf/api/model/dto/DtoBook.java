package com.arturmolla.bookshelf.api.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DtoBook {

    private Long id;
    private String title;
    private String genre;
    private String shortDescription;
}
