package com.arturmolla.bookshelf.api.model.repository;

import com.arturmolla.bookshelf.api.model.entity.EntityBook;
import org.hibernate.grammars.hql.HqlParser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepositoryBook extends JpaRepository<EntityBook, Long> {
}
