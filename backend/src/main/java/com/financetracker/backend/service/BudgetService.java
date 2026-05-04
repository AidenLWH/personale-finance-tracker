package com.financetracker.backend.service;

import com.financetracker.backend.dto.BudgetRequest;
import com.financetracker.backend.dto.BudgetResponse;
import com.financetracker.backend.model.Budget;
import com.financetracker.backend.model.Category;
import com.financetracker.backend.model.Transaction.TransactionType;
import com.financetracker.backend.model.User;
import com.financetracker.backend.repository.BudgetRepository;
import com.financetracker.backend.repository.CategoryRepository;
import com.financetracker.backend.repository.TransactionRepository;
import com.financetracker.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private BudgetResponse toResponse(Budget b) {
        User user = getCurrentUser();
        BigDecimal spent = transactionRepository.sumAmountByUserAndTypeAndMonth(
                user, TransactionType.EXPENSE, b.getMonth(), b.getYear()
        );
        return BudgetResponse.builder()
                .id(b.getId())
                .amount(b.getAmount())
                .spent(spent)
                .month(b.getMonth())
                .year(b.getYear())
                .categoryName(b.getCategory().getName())
                .categoryIcon(b.getCategory().getIcon())
                .build();
    }

    public List<BudgetResponse> getBudgets(Integer month, Integer year) {
        return budgetRepository
                .findByUserAndMonthAndYear(getCurrentUser(), month, year)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BudgetResponse createBudget(BudgetRequest request) {
        User user = getCurrentUser();
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        budgetRepository.findByUserAndCategoryAndMonthAndYear(
                user, category, request.getMonth(), request.getYear()
        ).ifPresent(b -> { throw new RuntimeException("Budget already exists for this category and month"); });

        Budget budget = Budget.builder()
                .amount(request.getAmount())
                .month(request.getMonth())
                .year(request.getYear())
                .user(user)
                .category(category)
                .build();

        return toResponse(budgetRepository.save(budget));
    }

    public BudgetResponse updateBudget(Long id, BudgetRequest request) {
        User user = getCurrentUser();
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        budget.setAmount(request.getAmount());
        return toResponse(budgetRepository.save(budget));
    }

    public void deleteBudget(Long id) {
        User user = getCurrentUser();
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        budgetRepository.delete(budget);
    }
}