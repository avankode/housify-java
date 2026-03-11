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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/houses")
@RequiredArgsConstructor
public class HouseController {

    private final HouseService houseService;
    private final UserRepository userRepository;

    @PostMapping("/create/")
    public ResponseEntity<HouseDTO> createHouse(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, String> payload) {
        User user = getUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(houseService.createHouse(user, payload.get("name")));
    }

    @PostMapping("/create-invite/")
    public ResponseEntity<?> createInvite(@AuthenticationPrincipal UserDetails userDetails, @RequestBody CreateInviteDTO dto) {
        User user = getUser(userDetails);
        try {
            TemporaryInvite invite = houseService.createInvite(user, dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("code", invite.getCode(), "expires_at", invite.getExpiresAt()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/use-invite/")
    public ResponseEntity<?> useInvite(@AuthenticationPrincipal UserDetails userDetails, @RequestBody UseInviteDTO dto) {
        User user = getUser(userDetails);
        try {
            return ResponseEntity.ok(houseService.useInvite(user, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/leave/")
    public ResponseEntity<?> leaveHouse(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        try {
            houseService.leaveHouse(user);
            return ResponseEntity.ok(Map.of("message", "Left house successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/delete/")
    public ResponseEntity<?> deleteHouse(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        try {
            houseService.deleteHouse(user);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/transfer-admin/")
    public ResponseEntity<?> transferAdmin(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, Long> payload) {
        User user = getUser(userDetails);
        try {
            houseService.transferAdmin(user, payload.get("new_admin_id"));
            return ResponseEntity.ok(Map.of("message", "Adminship transferred successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
