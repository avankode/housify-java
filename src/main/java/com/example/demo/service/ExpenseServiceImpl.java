package com.example.demo.service;

import com.example.demo.dto.BannerStatsDTO;
import com.example.demo.dto.ExpenseDTO;
import com.example.demo.model.Expense;
import com.example.demo.model.House;
import com.example.demo.model.User;
import com.example.demo.repository.ExpenseRepository;
import com.example.demo.strategy.ExpenseStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final MappingService mappingService;
    private final List<ExpenseStrategy> strategies;

    private Map<Expense.Category, ExpenseStrategy> getStrategyMap() {
        return strategies.stream().collect(Collectors.toMap(ExpenseStrategy::getCategory, Function.identity()));
    }

    @Override
    public List<ExpenseDTO> getAllExpenses(User user) {
        List<Expense> expenses = expenseRepository.findAllForUser(user, user.getHouse());
        return expenses.stream()
                .map(mappingService::mapToExpenseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ExpenseDTO createExpense(User user, Map<String, Object> payload) {
        Expense.Category category = Expense.Category.valueOf(payload.get("category").toString().toUpperCase());
        ExpenseStrategy strategy = getStrategyMap().get(category);

        if (strategy == null) {
            throw new RuntimeException("Unsupported expense category: " + category);
        }

        strategy.validate(user, payload);
        Expense expense = strategy.buildExpense(user, payload);
        expense = expenseRepository.save(expense);
        log.info("Expense '{}' (₹{}, {}) created by {}", expense.getName(), expense.getAmount(), category, user.getEmail());
        return mappingService.mapToExpenseDTO(expense);
    }

    @Override
    public List<ExpenseDTO> getFilteredExpenses(User user, String category, LocalDateTime startDate, LocalDateTime endDate) {
        Expense.Category cat = Expense.Category.valueOf(category.toUpperCase());
        List<Expense> expenses;
        if (cat == Expense.Category.PERSONAL_DUE) {
            expenses = expenseRepository.findByUserWhoPaidAndCategoryAndDateBetween(user, cat, startDate, endDate);
        } else {
            expenses = expenseRepository.findByHouseAndCategoryAndDateBetween(user.getHouse(), cat, startDate, endDate);
        }
        return expenses.stream()
                .map(mappingService::mapToExpenseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BannerStatsDTO getBannerStats(User user, LocalDateTime startDate, LocalDateTime endDate) {
        House house = user.getHouse();
        if (house == null) {
            throw new RuntimeException("User must be in a house to view banner stats.");
        }

        BigDecimal totalGroceries = expenseRepository.sumByHouseAndCategoryAndDateBetween(house, Expense.Category.GROCERIES, startDate, endDate);
        BigDecimal totalSharedRentals = expenseRepository.sumByHouseAndCategoryAndDateBetween(house, Expense.Category.SHARED_RENTAL, startDate, endDate);
        BigDecimal yourPersonalDues = expenseRepository.sumByUserWhoPaidAndCategoryAndDateBetween(user, Expense.Category.PERSONAL_DUE, startDate, endDate);

        return BannerStatsDTO.builder()
                .totalGroceries(totalGroceries != null ? totalGroceries : BigDecimal.ZERO)
                .totalSharedRentals(totalSharedRentals != null ? totalSharedRentals : BigDecimal.ZERO)
                .yourPersonalDues(yourPersonalDues != null ? yourPersonalDues : BigDecimal.ZERO)
                .memberCount(house.getMembers().size())
                .build();
    }
}
