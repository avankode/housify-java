package com.example.demo.strategy;

import com.example.demo.model.Expense;
import com.example.demo.model.User;
import java.util.Map;

public interface ExpenseStrategy {
    Expense.Category getCategory();
    void validate(User user, Map<String, Object> payload);
    Expense buildExpense(User user, Map<String, Object> payload);
}
