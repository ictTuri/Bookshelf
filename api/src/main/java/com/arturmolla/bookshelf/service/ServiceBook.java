package com.arturmolla.bookshelf.service;

import com.arturmolla.bookshelf.repository.RepositoryBook;
import com.arturmolla.bookshelf.model.dto.DtoBook;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@AllArgsConstructor
public class ServiceBook {

    private final RepositoryBook repositoryBook;

    public List<DtoBook> getAllAvailableBooks() {
        var results = repositoryBook.findAll();
        return Collections.emptyList();
    }
}
