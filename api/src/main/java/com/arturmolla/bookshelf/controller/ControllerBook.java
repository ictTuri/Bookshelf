package com.arturmolla.bookshelf.controller;

import com.arturmolla.bookshelf.service.ServiceBook;
import com.arturmolla.bookshelf.model.dto.DtoBook;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("book")
public class ControllerBook {

    private final ServiceBook serviceBook;

    @GetMapping("/all-books")
    @ResponseStatus(HttpStatus.OK)
    private List<DtoBook> getAllAvailableBooks() {
        return serviceBook.getAllAvailableBooks();
    }

}
