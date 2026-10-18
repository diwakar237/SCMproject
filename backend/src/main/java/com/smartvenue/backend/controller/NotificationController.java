package com.smartvenue.backend.controller;

import com.smartvenue.backend.domain.Notification;
import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.service.AuthService;
import com.smartvenue.backend.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "User alert notifications and unread badges")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService, AuthService authService) {
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "Get all notifications for authenticated user")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications count/list for authenticated user")
    public ResponseEntity<List<Notification>> getUnreadNotifications() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(notificationService.getUnreadNotifications(user.getId()));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/mark-all-read")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Void> markAllAsRead() {
        User user = authService.getCurrentAuthenticatedUser();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.noContent().build();
    }
}
