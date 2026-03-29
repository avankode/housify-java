package com.example.demo.repository;

import com.example.demo.model.LoginToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoginTokenRepository extends JpaRepository<LoginToken, Long> {
    Optional<LoginToken> findByToken(String token);
}
