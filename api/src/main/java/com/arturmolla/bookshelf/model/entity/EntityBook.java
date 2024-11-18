package com.arturmolla.bookshelf.model.entity;

import com.arturmolla.bookshelf.model.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Getter
@Setter
@Entity
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "book")
public class EntityBook extends EntityBase {

    private String title;
    private String synopsis;
    private String isbn;
    private String genre;
    private String bookCover;
    private String loanedTo;
    private Integer pageBookmark;
    private Boolean favourite = Boolean.FALSE;
    private Boolean archived = Boolean.FALSE;
    private Boolean shareable = Boolean.FALSE;
    private Boolean read = Boolean.FALSE;
    private Boolean loaned = Boolean.FALSE;
    private Boolean deleted = Boolean.FALSE;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @OneToMany(mappedBy = "book")
    private List<EntityFeedback> feedbacks;

    @OneToMany(mappedBy = "book")
    private List<EntityBookTransactionHistory> histories;
}
