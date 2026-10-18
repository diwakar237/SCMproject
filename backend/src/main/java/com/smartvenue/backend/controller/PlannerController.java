package com.smartvenue.backend.controller;

import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.dto.PlannerDto;
import com.smartvenue.backend.service.AuthService;
import com.smartvenue.backend.service.PlannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/planner")
@Tag(name = "Event Planner", description = "Template-driven checklist, timeline, and event day schedule management")
public class PlannerController {

    private final PlannerService plannerService;
    private final AuthService authService;

    public PlannerController(PlannerService plannerService, AuthService authService) {
        this.plannerService = plannerService;
        this.authService = authService;
    }

    @GetMapping("/tasks")
    @Operation(summary = "Get all tasks for current authenticated user")
    public ResponseEntity<List<PlannerDto.TaskResponse>> getMyTasks() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(plannerService.getUserTasks(user.getId()));
    }

    @PostMapping("/tasks")
    @Operation(summary = "Create custom task")
    public ResponseEntity<PlannerDto.TaskResponse> createTask(@Valid @RequestBody PlannerDto.TaskRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(plannerService.createTask(request, user));
    }

    @PutMapping("/tasks/{id}")
    @Operation(summary = "Update task details")
    public ResponseEntity<PlannerDto.TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody PlannerDto.TaskRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(plannerService.updateTask(id, request, user));
    }

    @PatchMapping("/tasks/{id}/toggle")
    @Operation(summary = "Toggle task completion status")
    public ResponseEntity<PlannerDto.TaskResponse> toggleTaskCompletion(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(plannerService.toggleTaskCompletion(id, user));
    }

    @DeleteMapping("/tasks/{id}")
    @Operation(summary = "Delete task")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        plannerService.deleteTask(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping({"/templates/apply", "/template"})
    @Operation(summary = "Apply pre-built template checklist (WEDDING, CORPORATE, PARTY)")
    public ResponseEntity<List<PlannerDto.TaskResponse>> applyTemplate(
            @RequestParam(required = false) String templateType,
            @RequestParam(required = false) String templateName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate eventDate,
            @RequestParam(required = false) Long eventId) {
        String type = templateType != null ? templateType : (templateName != null ? templateName : "WEDDING");
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(plannerService.applyTemplate(type, eventDate, eventId, user));
    }
}
