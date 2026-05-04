package com.financetracker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BudgetResponse {
    private Long id;
    private BigDecimal amount;
    private BigDecimal spent;
    private Integer month;
    private Integer year;
    private String categoryName;
    private String categoryIcon;
}