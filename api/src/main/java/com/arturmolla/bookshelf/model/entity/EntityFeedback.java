package com.arturmolla.bookshelf.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "feedback")
public class EntityFeedback extends EntityBase {

    private Double note;
    private String comment;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private EntityBook book;
}
