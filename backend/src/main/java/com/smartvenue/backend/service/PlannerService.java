package com.smartvenue.backend.service;

import com.smartvenue.backend.domain.Event;
import com.smartvenue.backend.domain.PlannerTask;
import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.dto.PlannerDto;
import com.smartvenue.backend.exception.Exceptions;
import com.smartvenue.backend.repository.EventRepository;
import com.smartvenue.backend.repository.PlannerTaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlannerService {

    private final PlannerTaskRepository taskRepository;
    private final EventRepository eventRepository;

    public PlannerService(PlannerTaskRepository taskRepository, EventRepository eventRepository) {
        this.taskRepository = taskRepository;
        this.eventRepository = eventRepository;
    }

    @Transactional(readOnly = true)
    public List<PlannerDto.TaskResponse> getUserTasks(Long userId) {
        return taskRepository.findByUserIdOrderByDeadlineDateAsc(userId)
                .stream()
                .map(PlannerDto.TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PlannerDto.TaskResponse createTask(PlannerDto.TaskRequest request, User user) {
        Event event = null;
        if (request.getEventId() != null) {
            event = eventRepository.findById(request.getEventId()).orElse(null);
        }

        PlannerTask task = new PlannerTask();
        task.setUser(user);
        task.setEvent(event);
        task.setCategory(request.getCategory() != null ? request.getCategory().toUpperCase() : "GENERAL");
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDeadlineDate(request.getDeadlineDate());
        task.setEventDayTime(request.getEventDayTime());
        task.setIsCompleted(request.getIsCompleted() != null ? request.getIsCompleted() : false);

        PlannerTask saved = taskRepository.save(task);
        return PlannerDto.TaskResponse.fromEntity(saved);
    }

    @Transactional
    public PlannerDto.TaskResponse updateTask(Long taskId, PlannerDto.TaskRequest request, User user) {
        PlannerTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Task not found with ID: " + taskId));

        if (!task.getUser().getId().equals(user.getId())) {
            throw new Exceptions.ForbiddenException("You do not have permission to modify this task.");
        }

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getCategory() != null) task.setCategory(request.getCategory().toUpperCase());
        if (request.getDeadlineDate() != null) task.setDeadlineDate(request.getDeadlineDate());
        if (request.getEventDayTime() != null) task.setEventDayTime(request.getEventDayTime());
        if (request.getIsCompleted() != null) task.setIsCompleted(request.getIsCompleted());

        PlannerTask saved = taskRepository.save(task);
        return PlannerDto.TaskResponse.fromEntity(saved);
    }

    @Transactional
    public PlannerDto.TaskResponse toggleTaskCompletion(Long taskId, User user) {
        PlannerTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Task not found with ID: " + taskId));

        if (!task.getUser().getId().equals(user.getId())) {
            throw new Exceptions.ForbiddenException("You do not have permission to modify this task.");
        }

        task.setIsCompleted(!task.getIsCompleted());
        PlannerTask saved = taskRepository.save(task);
        return PlannerDto.TaskResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteTask(Long taskId, User user) {
        PlannerTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Task not found with ID: " + taskId));

        if (!task.getUser().getId().equals(user.getId())) {
            throw new Exceptions.ForbiddenException("You do not have permission to delete this task.");
        }

        taskRepository.delete(task);
    }

    @Transactional
    public List<PlannerDto.TaskResponse> applyTemplate(String templateType, LocalDate eventDate, Long eventId, User user) {
        Event event = (eventId != null) ? eventRepository.findById(eventId).orElse(null) : null;
        List<PlannerTask> tasks = new ArrayList<>();

        LocalDate baseDate = (eventDate != null) ? eventDate : LocalDate.now().plusMonths(2);

        String normalized = templateType != null ? templateType.toUpperCase() : "WEDDING";
        if (normalized.contains("WEDDING")) {
            tasks.add(createTemplateTask(user, event, "VENUE", "Finalize and Confirm Venue Booking", "Review contract, confirm guest capacity, deposit payment", baseDate.minusMonths(2), null));
            tasks.add(createTemplateTask(user, event, "CATERING", "Select Tasting Menu & Beverage Packages", "Choose appetizers, main courses, and dietary alternatives", baseDate.minusWeeks(6), null));
            tasks.add(createTemplateTask(user, event, "INVITATION", "Send Digital RSVPs to Guest List", "Distribute RSVP link with dietary preference options", baseDate.minusWeeks(4), null));
            tasks.add(createTemplateTask(user, event, "DECOR", "Floral & Lighting Walkthrough", "Finalize ceremony arch, centerpieces, and backdrop styling", baseDate.minusWeeks(2), null));
            tasks.add(createTemplateTask(user, event, "EVENT_DAY", "Vendor Arrival & Rehearsal", "Ensure catering and sound crew arrive on-site", baseDate, "08:30 AM"));
            tasks.add(createTemplateTask(user, event, "EVENT_DAY", "Ceremony & Reception Grand Entry", "Queue audio visual cues and welcome guests", baseDate, "04:00 PM"));
        } else if (normalized.contains("CORP")) {
            tasks.add(createTemplateTask(user, event, "VENUE", "Book Conference Hall & Parking Allocations", "Verify high-speed wifi and stage configuration", baseDate.minusWeeks(4), null));
            tasks.add(createTemplateTask(user, event, "LOGISTICS", "Audio-Visual Testing & Stage Setup", "Projector, wireless microphones, and livestream test", baseDate.minusDays(3), null));
            tasks.add(createTemplateTask(user, event, "INVITATION", "Distribute Attendee Badges & Agenda", "Email conference schedule and parking passes", baseDate.minusDays(5), null));
            tasks.add(createTemplateTask(user, event, "EVENT_DAY", "Registration Desk Opens", "Issue guest badges and welcome kits", baseDate, "08:00 AM"));
            tasks.add(createTemplateTask(user, event, "EVENT_DAY", "Keynote Speaker Session", "Ensure stage technician is standing by", baseDate, "09:30 AM"));
        } else {
            // General / Party template
            tasks.add(createTemplateTask(user, event, "VENUE", "Select Venue and Timing", "Reserve desired morning or evening slot", baseDate.minusWeeks(3), null));
            tasks.add(createTemplateTask(user, event, "INVITATION", "Invite Friends & Family", "Gather RSVPs and plus-ones", baseDate.minusWeeks(2), null));
            tasks.add(createTemplateTask(user, event, "CATERING", "Order Cake and Refreshments", "Confirm custom cake design and finger foods", baseDate.minusWeeks(1), null));
            tasks.add(createTemplateTask(user, event, "EVENT_DAY", "Party Setup & Music Start", "Decorate tables and start playlist", baseDate, "05:00 PM"));
        }

        List<PlannerTask> saved = taskRepository.saveAll(tasks);
        return saved.stream().map(PlannerDto.TaskResponse::fromEntity).collect(Collectors.toList());
    }

    private PlannerTask createTemplateTask(User user, Event event, String category, String title, String description, LocalDate deadline, String time) {
        PlannerTask t = new PlannerTask();
        t.setUser(user);
        t.setEvent(event);
        t.setCategory(category);
        t.setTitle(title);
        t.setDescription(description);
        t.setDeadlineDate(deadline);
        t.setEventDayTime(time);
        t.setIsCompleted(false);
        return t;
    }
}
