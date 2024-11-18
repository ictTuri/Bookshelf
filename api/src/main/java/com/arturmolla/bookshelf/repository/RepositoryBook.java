package com.arturmolla.bookshelf.repository;

import com.arturmolla.bookshelf.model.entity.EntityBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepositoryBook extends JpaRepository<EntityBook, Long> {
}
