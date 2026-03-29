package com.example.demo.config;

import com.example.demo.model.LoginToken;
import com.example.demo.repository.LoginTokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final LoginTokenRepository loginTokenRepository;

    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        String token = UUID.randomUUID().toString();
        LoginToken loginToken = LoginToken.builder()
                .token(token)
                .email(email)
                .expiresAt(Instant.now().plusSeconds(120))
                .used(false)
                .build();
        loginTokenRepository.save(loginToken);

        String redirectUrl = frontendUrl + "/post-login-redirect?lt=" + token;
        log.info("OAuth2 login success for {}, redirecting with token to {}", email, frontendUrl + "/post-login-redirect");
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
