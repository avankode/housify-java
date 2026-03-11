package com.example.demo.strategy;

import com.example.demo.model.Expense;
import com.example.demo.model.User;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Map;

@Component
public class PersonalDueExpenseStrategy implements ExpenseStrategy {
    @Override
    public Expense.Category getCategory() { return Expense.Category.PERSONAL_DUE; }

    @Override
    public void validate(User user, Map<String, Object> payload) {}

    @Override
    public Expense buildExpense(User user, Map<String, Object> payload) {
        return Expense.builder()
                .name(payload.get("name").toString())
                .amount(new BigDecimal(payload.get("amount").toString()))
                .category(getCategory())
                .userWhoPaid(user)
                .house(null)
                .isRecurring(Boolean.TRUE.equals(payload.get("is_recurring")))
                .dueDayOfMonth((Integer) payload.get("due_day_of_month"))
                .details(payload.get("details"))
                .build();
    }
}
