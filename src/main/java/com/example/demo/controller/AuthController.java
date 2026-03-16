package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AuthController {
    @GetMapping("/accounts/google/login")
    public String googleLogin() {
        // Redirect to Spring Security's OAuth2 entry point
        return "redirect:/oauth2/authorization/google";
    }
}