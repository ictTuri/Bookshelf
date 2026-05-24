package com.arturmolla.bookshelf.model.dto;

import com.arturmolla.bookshelf.model.enums.AppFeedbackStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DtoAppFeedback {

    private Long id;
    private String title;
    private String description;
    private AppFeedbackStatus status;
    private int upvoteCount;
    // Populated for authenticated views; false for public views
    private boolean upvotedByCurrentUser;
    private boolean ownFeedback;
    private String age;
    private Instant createdDate;
    private String createdBy;
    private Long creatorId;
    private List<DtoComment> comments;
}