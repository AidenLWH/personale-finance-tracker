package com.financetracker.backend.dto;

import com.financetracker.backend.model.Transaction.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    private String description;

    @NotNull(message = "Type is required")
    private TransactionType type;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private Long categoryId;
}