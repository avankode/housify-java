package com.example.demo.repository;

import com.example.demo.model.TemporaryInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TemporaryInviteRepository extends JpaRepository<TemporaryInvite, Long> {
    Optional<TemporaryInvite> findByCode(String code);
}
