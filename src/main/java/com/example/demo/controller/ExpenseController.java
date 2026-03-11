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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserRepository userRepository;

    @GetMapping("/expenses/")
    public ResponseEntity<List<ExpenseDTO>> getExpenses(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(expenseService.getAllExpenses(user));
    }

    @PostMapping("/expenses/")
    public ResponseEntity<ExpenseDTO> createExpense(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, Object> payload) {
        User user = getUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.createExpense(user, payload));
    }

    @GetMapping("/stats/banner-summary/")
    public ResponseEntity<BannerStatsDTO> getBannerStats(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start_date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end_date) {
        
        User user = getUser(userDetails);
        try {
            return ResponseEntity.ok(expenseService.getBannerStats(user, start_date, end_date));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
