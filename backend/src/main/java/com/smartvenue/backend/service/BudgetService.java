package com.smartvenue.backend.service;

import com.smartvenue.backend.domain.EventBudget;
import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.domain.UserRole;
import com.smartvenue.backend.dto.BudgetDto;
import com.smartvenue.backend.exception.Exceptions;
import com.smartvenue.backend.repository.EventBudgetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final EventBudgetRepository budgetRepository;

    public BudgetService(EventBudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    @Transactional
    public BudgetDto.BudgetResponse createBudget(BudgetDto.BudgetRequest request, User user) {
        EventBudget budget = new EventBudget();
        budget.setUser(user);
        applyBudgetFields(budget, request);
        EventBudget saved = budgetRepository.save(budget);
        return BudgetDto.BudgetResponse.fromEntity(saved);
    }

    @Transactional
    public BudgetDto.BudgetResponse updateBudget(Long budgetId, BudgetDto.BudgetRequest request, User user) {
        EventBudget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Budget not found with ID: " + budgetId));

        if (!budget.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN) {
            throw new Exceptions.ForbiddenException("You are not authorized to modify this budget plan.");
        }

        applyBudgetFields(budget, request);
        budget.setUpdatedAt(LocalDateTime.now());
        EventBudget saved = budgetRepository.save(budget);
        return BudgetDto.BudgetResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<BudgetDto.BudgetResponse> getUserBudgets(Long userId) {
        return budgetRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(BudgetDto.BudgetResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BudgetDto.BudgetResponse getBudgetById(Long budgetId, User user) {
        EventBudget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Budget not found with ID: " + budgetId));

        if (!budget.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN) {
            throw new Exceptions.ForbiddenException("You are not authorized to view this budget plan.");
        }

        return BudgetDto.BudgetResponse.fromEntity(budget);
    }

    private void applyBudgetFields(EventBudget budget, BudgetDto.BudgetRequest request) {
        budget.setEventTitle(request.getEventTitle());
        budget.setTotalLimit(request.getTotalLimit() != null ? request.getTotalLimit() : BigDecimal.ZERO);
        budget.setVenueCost(request.getVenueCost() != null ? request.getVenueCost() : BigDecimal.ZERO);
        budget.setCateringCost(request.getCateringCost() != null ? request.getCateringCost() : BigDecimal.ZERO);
        budget.setDecorationCost(request.getDecorationCost() != null ? request.getDecorationCost() : BigDecimal.ZERO);
        budget.setPhotographyCost(request.getPhotographyCost() != null ? request.getPhotographyCost() : BigDecimal.ZERO);
        budget.setEntertainmentCost(request.getEntertainmentCost() != null ? request.getEntertainmentCost() : BigDecimal.ZERO);
        budget.setOtherCost(request.getOtherCost() != null ? request.getOtherCost() : BigDecimal.ZERO);

        BigDecimal contingencyPercent = request.getContingencyPercent() != null ? request.getContingencyPercent() : BigDecimal.valueOf(10.0);
        budget.setContingencyPercent(contingencyPercent);

        // Calculate Subtotal
        BigDecimal subtotal = budget.getVenueCost()
                .add(budget.getCateringCost())
                .add(budget.getDecorationCost())
                .add(budget.getPhotographyCost())
                .add(budget.getEntertainmentCost())
                .add(budget.getOtherCost());

        // Calculate Contingency = subtotal * (contingencyPercent / 100)
        BigDecimal contingencyMultiplier = contingencyPercent.divide(BigDecimal.valueOf(100.0), 4, RoundingMode.HALF_UP);
        BigDecimal contingencyAmount = subtotal.multiply(contingencyMultiplier).setScale(2, RoundingMode.HALF_UP);
        budget.setContingencyAmount(contingencyAmount);

        // Total Estimated Cost = subtotal + contingencyAmount
        BigDecimal totalEstimated = subtotal.add(contingencyAmount).setScale(2, RoundingMode.HALF_UP);
        budget.setTotalEstimatedCost(totalEstimated);

        if (request.getCurrency() != null && !request.getCurrency().trim().isEmpty()) {
            budget.setCurrency(request.getCurrency());
        }
    }
}
