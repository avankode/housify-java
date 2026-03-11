package com.example.demo.service;

import com.example.demo.dto.BannerStatsDTO;
import com.example.demo.dto.ExpenseDTO;
import com.example.demo.model.User;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface ExpenseService {
    List<ExpenseDTO> getAllExpenses(User user);
    ExpenseDTO createExpense(User user, Map<String, Object> payload);
    BannerStatsDTO getBannerStats(User user, LocalDateTime startDate, LocalDateTime endDate);
}
