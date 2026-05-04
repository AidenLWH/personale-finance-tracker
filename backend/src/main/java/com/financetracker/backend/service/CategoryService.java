package com.financetracker.backend.service;

import com.financetracker.backend.dto.CategoryRequest;
import com.financetracker.backend.dto.CategoryResponse;
import com.financetracker.backend.model.Category;
import com.financetracker.backend.model.User;
import com.financetracker.backend.repository.CategoryRepository;
import com.financetracker.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private CategoryResponse toResponse(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .icon(c.getIcon())
                .build();
    }

    public List<CategoryResponse> getAll() {
        return categoryRepository.findByUser(getCurrentUser())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse create(CategoryRequest request) {
        User user = getCurrentUser();

        categoryRepository.findByNameAndUser(request.getName(), user)
                .ifPresent(c -> { throw new RuntimeException("Category already exists"); });

        Category category = Category.builder()
                .name(request.getName())
                .icon(request.getIcon())
                .user(user)
                .build();

        return toResponse(categoryRepository.save(category));
    }

    public void delete(Long id) {
        User user = getCurrentUser();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (!category.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        categoryRepository.delete(category);
    }
}