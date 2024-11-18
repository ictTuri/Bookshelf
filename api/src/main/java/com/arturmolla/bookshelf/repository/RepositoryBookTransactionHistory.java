package com.arturmolla.bookshelf.repository;

import com.arturmolla.bookshelf.model.entity.EntityBookTransactionHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RepositoryBookTransactionHistory extends JpaRepository<EntityBookTransactionHistory, Long> {

    @Query("""
            SELECT history
            FROM EntityBookTransactionHistory history
            WHERE history.user.id = :userId""")
    Page<EntityBookTransactionHistory> findAllBorrowedBooks(Pageable pageable, Long userId);

    @Query("""
            SELECT history
            FROM EntityBookTransactionHistory history
            WHERE history.book.owner.id = :userId""")
    Page<EntityBookTransactionHistory> findAllReturnedBooks(Pageable pageable, Long userId);
}
