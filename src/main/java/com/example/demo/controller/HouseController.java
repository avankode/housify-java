package com.example.demo.controller;

import com.example.demo.dto.CreateInviteDTO;
import com.example.demo.dto.HouseDTO;
import com.example.demo.dto.UseInviteDTO;
import com.example.demo.model.TemporaryInvite;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.HouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/houses")
@RequiredArgsConstructor
public class HouseController {

    private final HouseService houseService;
    private final UserRepository userRepository;

    @PostMapping("/create/")
    public ResponseEntity<HouseDTO> createHouse(@AuthenticationPrincipal OAuth2User oAuth2User, @RequestBody Map<String, String> payload) {
        User user = getUser(oAuth2User);
        return ResponseEntity.status(HttpStatus.CREATED).body(houseService.createHouse(user, payload.get("name")));
    }

    @PostMapping("/create-invite/")
    public ResponseEntity<?> createInvite(@AuthenticationPrincipal OAuth2User oAuth2User, @RequestBody CreateInviteDTO dto) {
        User user = getUser(oAuth2User);
        try {
            TemporaryInvite invite = houseService.createInvite(user, dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("code", invite.getCode(), "expires_at", invite.getExpiresAt()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/use-invite/")
    public ResponseEntity<?> useInvite(@AuthenticationPrincipal OAuth2User oAuth2User, @RequestBody UseInviteDTO dto) {
        User user = getUser(oAuth2User);
        try {
            return ResponseEntity.ok(houseService.useInvite(user, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/leave/")
    public ResponseEntity<?> leaveHouse(@AuthenticationPrincipal OAuth2User oAuth2User) {
        User user = getUser(oAuth2User);
        try {
            houseService.leaveHouse(user);
            return ResponseEntity.ok(Map.of("message", "Left house successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/delete/")
    public ResponseEntity<?> deleteHouse(@AuthenticationPrincipal OAuth2User oAuth2User) {
        User user = getUser(oAuth2User);
        try {
            houseService.deleteHouse(user);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/transfer-admin/")
    public ResponseEntity<?> transferAdmin(@AuthenticationPrincipal OAuth2User oAuth2User, @RequestBody Map<String, Long> payload) {
        User user = getUser(oAuth2User);
        try {
            houseService.transferAdmin(user, payload.get("new_admin_id"));
            return ResponseEntity.ok(Map.of("message", "Adminship transferred successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private User getUser(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
