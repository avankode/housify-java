package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CsrfController {

    /**
     * Bootstraps the CSRF cookie for SPA clients.
     * With CookieCsrfTokenRepository configured to use Django-style names,
     * calling this endpoint causes Spring Security to generate a token and
     * set the "csrftoken" cookie.
     */
    @GetMapping("/csrf/")
    public ResponseEntity<Void> csrf(CsrfToken csrfToken) {
        // Force token generation and persistence via CookieCsrfTokenRepository
        if (csrfToken != null) {
            csrfToken.getToken();
        }
        return ResponseEntity.noContent().build();
    }
}

