package com.example.demo.factory;

import com.example.demo.model.TemporaryInvite;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Random;

@Component
public class OtpInviteGenerator implements InviteGenerator {
    @Override
    public TemporaryInvite.InviteType getType() { return TemporaryInvite.InviteType.OTP; }

    @Override
    public String generateCode() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }

    @Override
    public LocalDateTime getExpiryTime() { return LocalDateTime.now().plusMinutes(5); }
}
