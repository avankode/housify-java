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
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final MappingService mappingService;

    @PatchMapping("/update/")
    public ResponseEntity<ProfileDTO> updateProfile(@AuthenticationPrincipal OAuth2User oAuth2User, @RequestBody ProfileDTO dto) {
        User user = getUser(oAuth2User);
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

    private User getUser(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
