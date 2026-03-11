package com.example.demo.factory;

import com.example.demo.model.TemporaryInvite;
import java.time.LocalDateTime;

public interface InviteGenerator {
    TemporaryInvite.InviteType getType();
    String generateCode();
    LocalDateTime getExpiryTime();
}
