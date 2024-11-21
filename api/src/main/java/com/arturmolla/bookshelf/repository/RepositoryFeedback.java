package com.arturmolla.bookshelf.repository;

import com.arturmolla.bookshelf.model.entity.EntityFeedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RepositoryFeedback extends JpaRepository<EntityFeedback, Long> {

    @Query("""
            SELECT feedback
            FROM EntityFeedback feedback
            WHERE feedback.book.id = :bookId""")
    Page<EntityFeedback> findAllByBookId(Long bookId, Pageable pageable);
}
