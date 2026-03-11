package com.example.demo.factory;

import com.example.demo.model.TemporaryInvite;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class LinkInviteGenerator implements InviteGenerator {
    @Override
    public TemporaryInvite.InviteType getType() { return TemporaryInvite.InviteType.LINK; }

    @Override
    public String generateCode() { return UUID.randomUUID().toString(); }

    @Override
    public LocalDateTime getExpiryTime() { return LocalDateTime.now().plusHours(24); }
}
