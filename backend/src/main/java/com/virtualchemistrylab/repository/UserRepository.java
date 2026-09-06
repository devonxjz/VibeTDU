package com.virtualchemistrylab.repository;

import com.virtualchemistrylab.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByGoogleSub(String googleSub);

    boolean existsByEmailIgnoreCase(String email);
}
