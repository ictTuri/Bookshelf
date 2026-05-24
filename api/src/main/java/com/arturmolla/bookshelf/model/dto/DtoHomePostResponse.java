package com.arturmolla.bookshelf.model.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.List;

@Builder
public record DtoHomePostResponse(
        Long id,
        String title,
        String content,
        String authorName,
        Long authorId,
        String authorEmail,
        Instant createdDate,
        Instant lastModifiedDate,
        List<DtoAttachmentResponse> attachments,
        long likeCount,
        long commentCount,
        long shareCount,
        boolean likedByCurrentUser
) {
}

