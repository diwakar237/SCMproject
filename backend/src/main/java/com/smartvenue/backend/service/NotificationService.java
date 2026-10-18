package com.smartvenue.backend.service;

import com.smartvenue.backend.domain.Notification;
import com.smartvenue.backend.domain.User;

import java.util.List;

public interface NotificationService {

    Notification createNotification(User user, String title, String message);

    List<Notification> getUserNotifications(Long userId);

    List<Notification> getUnreadNotifications(Long userId);

    void markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);
}
