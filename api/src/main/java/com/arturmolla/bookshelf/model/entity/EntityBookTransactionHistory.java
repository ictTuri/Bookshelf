package com.arturmolla.bookshelf.model.entity;


import com.arturmolla.bookshelf.model.user.User;
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
@Table(name = "book_transaction_history")
public class EntityBookTransactionHistory extends EntityBase {

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne
    @JoinColumn(name = "book_id")
    private EntityBook book;

    private Boolean returned = Boolean.FALSE;
    private Boolean returnedApproved = Boolean.FALSE;
}
