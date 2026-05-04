package com.financetracker.backend.repository;

import com.financetracker.backend.model.Transaction;
import com.financetracker.backend.model.User;
import com.financetracker.backend.model.Category;
import com.financetracker.backend.model.Transaction.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserOrderByDateDesc(User user);
    List<Transaction> findByUserAndTypeOrderByDateDesc(User user, TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = :type")
    BigDecimal sumAmountByUserAndType(@Param("user") User user, @Param("type") TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = :type AND MONTH(t.date) = :month AND YEAR(t.date) = :year")
    BigDecimal sumAmountByUserAndTypeAndMonth(@Param("user") User user, @Param("type") TransactionType type, @Param("month") int month, @Param("year") int year);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = :type AND MONTH(t.date) = :month AND YEAR(t.date) = :year AND t.category = :category")
    BigDecimal sumAmountByUserAndTypeAndMonthAndCategory(@Param("user") User user, @Param("type") TransactionType type, @Param("month") int month, @Param("year") int year, @Param("category") Category category);


    List<Transaction> findTop5ByUserOrderByCreatedAtDesc(User user);
    
}
