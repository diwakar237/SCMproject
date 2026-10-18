package com.smartvenue.backend.controller;

import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.dto.BudgetDto;
import com.smartvenue.backend.service.AuthService;
import com.smartvenue.backend.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@Tag(name = "Budgets", description = "Event budget estimation, pricing breakdowns, and contingency calculations")
public class BudgetController {

    private final BudgetService budgetService;
    private final AuthService authService;

    public BudgetController(BudgetService budgetService, AuthService authService) {
        this.budgetService = budgetService;
        this.authService = authService;
    }

    @PostMapping
    @Operation(summary = "Create and save an event budget estimation")
    public ResponseEntity<BudgetDto.BudgetResponse> createBudget(@Valid @RequestBody BudgetDto.BudgetRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        BudgetDto.BudgetResponse created = budgetService.createBudget(request, user);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @Operation(summary = "Get all saved budgets for the currently logged-in user")
    public ResponseEntity<List<BudgetDto.BudgetResponse>> getMyBudgets() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(budgetService.getUserBudgets(user.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific budget calculation by ID")
    public ResponseEntity<BudgetDto.BudgetResponse> getBudgetById(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(budgetService.getBudgetById(id, user));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing event budget estimation")
    public ResponseEntity<BudgetDto.BudgetResponse> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetDto.BudgetRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(budgetService.updateBudget(id, request, user));
    }
}
