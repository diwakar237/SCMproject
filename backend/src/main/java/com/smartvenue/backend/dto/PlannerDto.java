package com.smartvenue.backend.dto;

import com.smartvenue.backend.domain.PlannerTask;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PlannerDto {

    public static class TaskRequest {
        private Long eventId;

        private String category = "GENERAL";

        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        private LocalDate deadlineDate;

        private String eventDayTime; // e.g. "09:00 AM"

        private Boolean isCompleted = false;

        public Long getEventId() { return eventId; }
        public void setEventId(Long eventId) { this.eventId = eventId; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public LocalDate getDeadlineDate() { return deadlineDate; }
        public void setDeadlineDate(LocalDate deadlineDate) { this.deadlineDate = deadlineDate; }

        public String getEventDayTime() { return eventDayTime; }
        public void setEventDayTime(String eventDayTime) { this.eventDayTime = eventDayTime; }

        public Boolean getIsCompleted() { return isCompleted; }
        public void setIsCompleted(Boolean completed) { isCompleted = completed; }
    }

    public static class TaskResponse {
        private Long id;
        private Long userId;
        private Long eventId;
        private String category;
        private String title;
        private String description;
        private LocalDate deadlineDate;
        private String eventDayTime;
        private Boolean isCompleted;
        private LocalDateTime createdAt;

        public static TaskResponse fromEntity(PlannerTask t) {
            TaskResponse res = new TaskResponse();
            res.id = t.getId();
            res.userId = t.getUser().getId();
            if (t.getEvent() != null) {
                res.eventId = t.getEvent().getId();
            }
            res.category = t.getCategory();
            res.title = t.getTitle();
            res.description = t.getDescription();
            res.deadlineDate = t.getDeadlineDate();
            res.eventDayTime = t.getEventDayTime();
            res.isCompleted = t.getIsCompleted();
            res.createdAt = t.getCreatedAt();
            return res;
        }

        public Long getId() { return id; }
        public Long getUserId() { return userId; }
        public Long getEventId() { return eventId; }
        public String getCategory() { return category; }
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public LocalDate getDeadlineDate() { return deadlineDate; }
        public String getEventDayTime() { return eventDayTime; }
        public Boolean getIsCompleted() { return isCompleted; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }
}
