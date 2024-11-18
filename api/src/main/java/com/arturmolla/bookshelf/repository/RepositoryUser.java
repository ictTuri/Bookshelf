package com.arturmolla.bookshelf.repository;

import com.arturmolla.bookshelf.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RepositoryUser extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}
