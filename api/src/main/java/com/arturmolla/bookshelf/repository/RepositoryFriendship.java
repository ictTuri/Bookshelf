package com.arturmolla.bookshelf.repository;

import com.arturmolla.bookshelf.model.entity.EntityFriendship;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RepositoryFriendship extends JpaRepository<EntityFriendship, Long> {

    Page<EntityFriendship> findByUserId(Long userId, Pageable pageable);

    Optional<EntityFriendship> findByUserIdAndFriendId(Long userId, Long friendId);

    boolean existsByUserIdAndFriendId(Long userId, Long friendId);

    void deleteByUserIdAndFriendId(Long userId, Long friendId);
    
    long countByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM EntityFriendship f WHERE f.user.id = :userId OR f.friend.id = :userId")
    void deleteAllInvolvingUser(@Param("userId") Long userId);
}