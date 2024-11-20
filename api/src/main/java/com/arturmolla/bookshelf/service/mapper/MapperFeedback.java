package com.arturmolla.bookshelf.service.mapper;

import com.arturmolla.bookshelf.model.dto.DtoFeedbackRequest;
import com.arturmolla.bookshelf.model.entity.EntityBook;
import com.arturmolla.bookshelf.model.entity.EntityFeedback;

public class MapperFeedback {

    public EntityFeedback toFeedbackEntity(DtoFeedbackRequest request) {
        return EntityFeedback.builder()
                .note(request.note())
                .comment(request.comment())
                .book(EntityBook.builder().id(request.bookId()).build())
                .build();
    }
}
