package com.arturmolla.bookshelf.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DtoBorrowedBooksResponse {

    private Long id;
    private String title;
    private String authorName;
    private String isbn;
    private Double rate;
    private Boolean returned;
    private Boolean returnApproved;
}
