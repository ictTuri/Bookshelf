package com.arturmolla.bookshelf.repository;

import com.arturmolla.bookshelf.model.entity.EntityFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepositoryFeedback extends JpaRepository<EntityFeedback, Long> {
}
