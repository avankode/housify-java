package com.example.demo.repository;

import com.example.demo.model.Expense;
import com.example.demo.model.House;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByHouseAndCategoryAndDateBetween(House house, Expense.Category category, LocalDateTime start, LocalDateTime end);
    List<Expense> findByUserWhoPaidAndCategoryAndDateBetween(User user, Expense.Category category, LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.house = :house AND e.category = :category AND e.date >= :start AND e.date < :end")
    BigDecimal sumByHouseAndCategoryAndDateBetween(@Param("house") House house, @Param("category") Expense.Category category, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.userWhoPaid = :user AND e.category = :category AND e.date >= :start AND e.date < :end")
    BigDecimal sumByUserWhoPaidAndCategoryAndDateBetween(@Param("user") User user, @Param("category") Expense.Category category, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT e FROM Expense e WHERE (e.house = :house AND e.category != 'PERSONAL_DUE') OR (e.userWhoPaid = :user AND e.category = 'PERSONAL_DUE') ORDER BY e.date DESC")
    List<Expense> findAllForUser(@Param("user") User user, @Param("house") House house);
}
