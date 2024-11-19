package com.arturmolla.bookshelf.repository;

import com.arturmolla.bookshelf.model.entity.EntityBookTransactionHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

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

    @Query("""
            SELECT (COUNT(*) > 0) AS isBorrowed
            FROM EntityBookTransactionHistory history
            WHERE history.user.id = :userId
            AND history.book.id = :bookId
            AND history.returnApproved = false""")
    boolean isAlreadyBorrowedByUser(Long bookId, Long userId);

    @Query("""
            SELECT history
            FROM EntityBookTransactionHistory history
            WHERE history.user.id = :userId
            AND history.book.id = :bookId
            AND history.returned = false
            AND history.returnApproved = false""")
    Optional<EntityBookTransactionHistory> findByBookIdAndUserId(Long bookId, Long userId);

    @Query("""
            SELECT history
            FROM EntityBookTransactionHistory history
            WHERE history.book.owner.id = :userId
            AND history.book.id = :bookId
            AND history.returned = true
            AND history.returnApproved = false""")
    Optional<EntityBookTransactionHistory> findByBookIdAndOwnerId(Long bookId, Long id);
}
