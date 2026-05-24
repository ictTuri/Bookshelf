package com.arturmolla.bookshelf.model.dto;

import lombok.Builder;

import java.time.Instant;

@Builder
public record DtoPostCommentResponse(
        Long id,
        String content,
        Long authorId,
        String authorName,
        String authorEmail,
        Instant createdDate,
        Instant lastModifiedDate
) {
}

