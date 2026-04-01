package com.example.demo.controller;

import com.example.demo.dto.UserDTO;
import com.example.demo.model.LoginToken;
import com.example.demo.model.User;
import com.example.demo.repository.LoginTokenRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.MappingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthExchangeController {

    private final LoginTokenRepository loginTokenRepository;
    private final UserRepository userRepository;
    private final MappingService mappingService;

    @PostMapping("/exchange-token/")
    @Transactional
    public ResponseEntity<?> exchangeToken(@RequestParam("lt") String tokenValue,
                                           HttpServletRequest request) {
        Optional<LoginToken> tokenOpt = loginTokenRepository.findByToken(tokenValue);

        if (tokenOpt.isEmpty()) {
            log.warn("Token exchange attempted with unknown token");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }

        LoginToken loginToken = tokenOpt.get();

        if (loginToken.isUsed()) {
            log.warn("Token exchange attempted with already-used token for {}", loginToken.getEmail());
            return ResponseEntity.status(401).body(Map.of("error", "Token already used"));
        }

        if (Instant.now().isAfter(loginToken.getExpiresAt())) {
            log.warn("Token exchange attempted with expired token for {}", loginToken.getEmail());
            return ResponseEntity.status(401).body(Map.of("error", "Token expired"));
        }

        // Mark token as used
        loginToken.setUsed(true);
        loginTokenRepository.save(loginToken);

        String email = loginToken.getEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // Build an OAuth2User with the user's email as the name attribute
        Map<String, Object> attributes = Map.of(
                "email", email,
                "name", user.getProfile() != null ? user.getProfile().getDisplayName() : email,
                "sub", email
        );
        OAuth2User oAuth2User = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "email"
        );

        OAuth2AuthenticationToken authToken = new OAuth2AuthenticationToken(
                oAuth2User,
                oAuth2User.getAuthorities(),
                "google"
        );

        // Invalidate existing session (session fixation protection) and create a fresh one.
        // This guarantees Set-Cookie is always present in the response so the browser
        // can store the session regardless of whether one already existed from the OAuth2 callback.
        HttpSession existing = request.getSession(false);
        if (existing != null) {
            existing.invalidate();
        }
        HttpSession session = request.getSession(true);
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authToken);
        SecurityContextHolder.setContext(securityContext);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);

        log.info("Token exchange successful for {}, session: {}", email, session.getId());

        UserDTO userDTO = mappingService.mapToUserDTO(user);
        return ResponseEntity.ok(userDTO);
    }
}
