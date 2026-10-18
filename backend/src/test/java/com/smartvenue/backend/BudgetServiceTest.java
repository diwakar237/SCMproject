package com.smartvenue.backend.service;

import com.smartvenue.backend.domain.EventBudget;
import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.domain.UserRole;
import com.smartvenue.backend.dto.BudgetDto;
import com.smartvenue.backend.repository.EventBudgetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BudgetServiceTest {

    @Mock
    private EventBudgetRepository budgetRepository;

    private BudgetService budgetService;
    private User testUser;

    @BeforeEach
    void setUp() {
        budgetService = new BudgetService(budgetRepository);
        testUser = new User();
        testUser.setId(10L);
        testUser.setFullName("John Planner");
        testUser.setRole(UserRole.CUSTOMER);
    }

    @Test
    void testBudgetCalculationsAndContingencyMath() {
        BudgetDto.BudgetRequest request = new BudgetDto.BudgetRequest();
        request.setEventTitle("Anniversary Gala");
        request.setTotalLimit(BigDecimal.valueOf(10000.00));
        request.setVenueCost(BigDecimal.valueOf(2500.00));
        request.setCateringCost(BigDecimal.valueOf(3000.00));
        request.setDecorationCost(BigDecimal.valueOf(1000.00));
        request.setPhotographyCost(BigDecimal.valueOf(800.00));
        request.setEntertainmentCost(BigDecimal.valueOf(700.00));
        request.setOtherCost(BigDecimal.valueOf(200.00));
        request.setContingencyPercent(BigDecimal.valueOf(10.00)); // 10%

        when(budgetRepository.save(any(EventBudget.class))).thenAnswer(invocation -> {
            EventBudget b = invocation.getArgument(0);
            b.setId(1L);
            return b;
        });

        BudgetDto.BudgetResponse response = budgetService.createBudget(request, testUser);

        // Subtotal = 2500 + 3000 + 1000 + 800 + 700 + 200 = 8200.00
        assertEquals(new BigDecimal("8200.00"), response.getSubtotal());

        // Contingency = 8200 * 0.10 = 820.00
        assertEquals(new BigDecimal("820.00"), response.getContingencyAmount());

        // Total Estimated Cost = 8200 + 820 = 9020.00
        assertEquals(new BigDecimal("9020.00"), response.getTotalEstimatedCost());

        // Variance = 10000 - 9020 = 980.00 (under budget)
        assertEquals(new BigDecimal("980.00"), response.getVariance());
        assertFalse(response.isOverBudget(), "Should not be over budget when within limit");
    }

    @Test
    void testOverBudgetFlagWhenLimitExceeded() {
        BudgetDto.BudgetRequest request = new BudgetDto.BudgetRequest();
        request.setEventTitle("Luxury Launch");
        request.setTotalLimit(BigDecimal.valueOf(5000.00));
        request.setVenueCost(BigDecimal.valueOf(3000.00));
        request.setCateringCost(BigDecimal.valueOf(3000.00));
        // Subtotal = 6000.00, with 10% contingency = 6600.00 > 5000 limit

        when(budgetRepository.save(any(EventBudget.class))).thenAnswer(invocation -> {
            EventBudget b = invocation.getArgument(0);
            b.setId(2L);
            return b;
        });

        BudgetDto.BudgetResponse response = budgetService.createBudget(request, testUser);

        assertTrue(response.isOverBudget(), "Should flag over budget when estimate exceeds limit");
        assertTrue(response.getVariance().compareTo(BigDecimal.ZERO) < 0, "Variance should be negative");
    }
}
