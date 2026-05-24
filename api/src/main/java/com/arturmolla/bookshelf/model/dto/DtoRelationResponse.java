package com.arturmolla.bookshelf.model.dto;

import com.arturmolla.bookshelf.model.enums.RelationStatus;
import com.arturmolla.bookshelf.model.enums.RelationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DtoRelationResponse {

    private Long id;

    /** ID of the user who initiated the relation. */
    private Long requesterId;
    private String requesterFullName;

    /** ID of the user who is the target. */
    private Long addresseeId;
    private String addresseeFullName;

    private RelationType relationType;
    private RelationStatus status;
    private Instant createdAt;
}

