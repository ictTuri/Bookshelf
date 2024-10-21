package com.arturmolla.bookshelf.api.service;

import com.arturmolla.bookshelf.api.model.converter.ConverterBook;
import com.arturmolla.bookshelf.api.model.repository.RepositoryBook;
import com.arturmolla.bookshelf.api.model.dto.DtoBook;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ServiceBook {

    private final RepositoryBook repositoryBook;

    public List<DtoBook> getAllAvailableBooks() {
        var results = repositoryBook.findAll();
        return results.stream().map(book -> ConverterBook.toDtoConverter(book)).toList();
    }
}
