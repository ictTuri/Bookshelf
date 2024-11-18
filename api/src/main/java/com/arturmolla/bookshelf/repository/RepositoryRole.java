package com.arturmolla.bookshelf.repository;

import com.arturmolla.bookshelf.model.user.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RepositoryRole extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);
}
