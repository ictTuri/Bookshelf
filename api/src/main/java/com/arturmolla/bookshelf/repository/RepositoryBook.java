package com.arturmolla.bookshelf.repository;

import com.arturmolla.bookshelf.model.entity.EntityBook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RepositoryBook extends JpaRepository<EntityBook, Long>, JpaSpecificationExecutor<EntityBook> {

    @Query("""
            SELECT book
            FROM EntityBook book
            WHERE book.archived = false
            AND book.shareable = true
            AND book.owner.id != :userId""")
    Page<EntityBook> findAllDisplayableBooks(Pageable pageable, Long userId);
}
