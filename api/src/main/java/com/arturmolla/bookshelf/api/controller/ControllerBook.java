package com.arturmolla.bookshelf.api.controller;

import com.arturmolla.bookshelf.api.service.ServiceBook;
import com.arturmolla.bookshelf.api.model.dto.DtoBook;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/book")
public class ControllerBook {

    private final ServiceBook serviceBook;

    @GetMapping("/all-books")
    @ResponseStatus(HttpStatus.OK)
    private List<DtoBook> getAllAvailableBooks(@AuthenticationPrincipal OAuth2User user) {
        return serviceBook.getAllAvailableBooks();
    }

}
