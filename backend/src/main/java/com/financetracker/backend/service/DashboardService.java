package com.financetracker.backend.service;

import com.financetracker.backend.dto.DashboardResponse;
import com.financetracker.backend.model.Transaction.TransactionType;
import com.financetracker.backend.model.User;
import com.financetracker.backend.repository.BudgetRepository;
import com.financetracker.backend.repository.TransactionRepository;
import com.financetracker.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final BudgetService budgetService;
    private final TransactionService transactionService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public DashboardResponse getDashboard() {
        User user = getCurrentUser();
        int month = LocalDate.now().getMonthValue();
        int year = LocalDate.now().getYear();

        BigDecimal totalIncome = transactionRepository
                .sumAmountByUserAndType(user, TransactionType.INCOME);
        BigDecimal totalExpenses = transactionRepository
                .sumAmountByUserAndType(user, TransactionType.EXPENSE);
        BigDecimal netSavings = totalIncome.subtract(totalExpenses);

        return DashboardResponse.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netSavings(netSavings)
                .recentTransactions(transactionService.getAllTransactions()
                        .stream().limit(5).collect(java.util.stream.Collectors.toList()))
                .budgets(budgetService.getBudgets(month, year))
                .build();
    }
}