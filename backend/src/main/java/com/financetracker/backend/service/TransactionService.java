package com.financetracker.backend.service;

import com.financetracker.backend.dto.TransactionRequest;
import com.financetracker.backend.dto.TransactionResponse;
import com.financetracker.backend.model.Category;
import com.financetracker.backend.model.Transaction;
import com.financetracker.backend.model.Transaction.TransactionType;
import com.financetracker.backend.model.User;
import com.financetracker.backend.repository.CategoryRepository;
import com.financetracker.backend.repository.TransactionRepository;
import com.financetracker.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private TransactionResponse toResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .amount(t.getAmount())
                .description(t.getDescription())
                .type(t.getType())
                .date(t.getDate())
                .createdAt(t.getCreatedAt())
                .categoryName(t.getCategory() != null ? t.getCategory().getName() : null)
                .categoryIcon(t.getCategory() != null ? t.getCategory().getIcon() : null)
                .build();
    }

    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository
                .findByUserOrderByDateDesc(getCurrentUser())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TransactionResponse createTransaction(TransactionRequest request) {
        User user = getCurrentUser();

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .description(request.getDescription())
                .type(request.getType())
                .date(request.getDate())
                .user(user)
                .category(category)
                .build();

        return toResponse(transactionRepository.save(transaction));
    }

    public TransactionResponse updateTransaction(Long id, TransactionRequest request) {
        User user = getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setType(request.getType());
        transaction.setDate(request.getDate());
        transaction.setCategory(category);

        return toResponse(transactionRepository.save(transaction));
    }

    public void deleteTransaction(Long id) {
        User user = getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        transactionRepository.delete(transaction);
    }
}