package com.example.demo.controller;

import com.example.demo.dto.ProfileDTO;
import com.example.demo.model.Profile;
import com.example.demo.model.User;
import com.example.demo.repository.ProfileRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.MappingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final MappingService mappingService;

    @PutMapping("/update/")
    public ResponseEntity<ProfileDTO> updateProfile(@AuthenticationPrincipal UserDetails userDetails, @RequestBody ProfileDTO dto) {
        User user = getUser(userDetails);
        Profile profile = user.getProfile();
        
        if (profile == null) {
            profile = Profile.builder().user(user).build();
        }
        
        if (dto.getDisplayName() != null) profile.setDisplayName(dto.getDisplayName());
        if (dto.getPhoneNumber() != null) profile.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getProfilePhoto() != null) profile.setProfilePhoto(dto.getProfilePhoto());
        
        profile = profileRepository.save(profile);
        return ResponseEntity.ok(mappingService.mapToProfileDTO(profile));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
