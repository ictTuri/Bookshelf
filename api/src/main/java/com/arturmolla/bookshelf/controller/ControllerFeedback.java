package com.arturmolla.bookshelf.controller;

import com.arturmolla.bookshelf.model.common.PageResponse;
import com.arturmolla.bookshelf.model.dto.DtoFeedbackRequest;
import com.arturmolla.bookshelf.model.dto.DtoFeedbackResponse;
import com.arturmolla.bookshelf.service.ServiceFeedback;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("feedbacks")
@RequiredArgsConstructor
@Tag(name = "Feedback")
public class ControllerFeedback {

    private final ServiceFeedback service;

    @PostMapping
    public ResponseEntity<Long> saveFeedback(
            @Valid @RequestBody DtoFeedbackRequest request,
            Authentication connectedUser
    ) {
        return ResponseEntity.ok(service.saveFeedback(request, connectedUser));
    }

    @GetMapping("/book/{book-id}")
    public ResponseEntity<PageResponse<DtoFeedbackResponse>> findFeedbacksForBook(
            @PathVariable("book-id") Long bookId,
            @RequestParam(name = "page", defaultValue = "0", required = false) int page,
            @RequestParam(name = "size", defaultValue = "10", required = false) int size,
            Authentication connectedUser
    ) {
        return ResponseEntity.ok(service.findFeedbacksForBook(bookId, page, size, connectedUser));
    }
}
