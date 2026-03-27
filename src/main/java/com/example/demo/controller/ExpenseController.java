package com.example.demo.controller;

import com.example.demo.dto.BannerStatsDTO;
import com.example.demo.dto.ExpenseDTO;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserRepository userRepository;

    @GetMapping("/expenses/")
    public ResponseEntity<Map<String, Object>> getExpenses(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @RequestParam("category") String category,
            @RequestParam("start_date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam("end_date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        User user = getUser(oAuth2User);
        List<ExpenseDTO> results = expenseService.getFilteredExpenses(user, category, startDate, endDate);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("count", results.size());
        response.put("next", null);
        response.put("previous", null);
        response.put("results", results);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/expenses/")
    public ResponseEntity<ExpenseDTO> createExpense(@AuthenticationPrincipal OAuth2User oAuth2User, @RequestBody Map<String, Object> payload) {
        User user = getUser(oAuth2User);
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.createExpense(user, payload));
    }

    @GetMapping("/stats/banner-summary/")
    public ResponseEntity<BannerStatsDTO> getBannerStats(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @RequestParam("start_date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam("end_date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        User user = getUser(oAuth2User);
        try {
            return ResponseEntity.ok(expenseService.getBannerStats(user, startDate, endDate));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private User getUser(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
