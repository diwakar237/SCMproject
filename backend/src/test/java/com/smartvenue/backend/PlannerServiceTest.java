package com.smartvenue.backend;

import com.smartvenue.backend.domain.PlannerTask;
import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.domain.UserRole;
import com.smartvenue.backend.dto.PlannerDto;
import com.smartvenue.backend.repository.EventRepository;
import com.smartvenue.backend.repository.PlannerTaskRepository;
import com.smartvenue.backend.service.PlannerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PlannerServiceTest {

    @Mock
    private PlannerTaskRepository taskRepository;

    @Mock
    private EventRepository eventRepository;

    private PlannerService plannerService;
    private User testUser;

    @BeforeEach
    void setUp() {
        plannerService = new PlannerService(taskRepository, eventRepository);

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("organizer@demo.com");
        testUser.setRole(UserRole.CUSTOMER);
    }

    @Test
    void createTask_savesAndReturnsTask() {
        when(taskRepository.save(any(PlannerTask.class))).thenAnswer(i -> {
            PlannerTask t = i.getArgument(0);
            t.setId(50L);
            return t;
        });

        PlannerDto.TaskRequest req = new PlannerDto.TaskRequest();
        req.setTitle("Book Band");
        req.setCategory("MUSIC");
        req.setDeadlineDate(LocalDate.now().plusWeeks(2));

        var res = plannerService.createTask(req, testUser);
        assertNotNull(res);
        assertEquals(50L, res.getId());
        assertEquals("Book Band", res.getTitle());
        assertEquals("MUSIC", res.getCategory());
        assertFalse(res.getIsCompleted());
    }

    @Test
    void toggleTaskCompletion_flipsStatus() {
        PlannerTask task = new PlannerTask();
        task.setId(50L);
        task.setUser(testUser);
        task.setIsCompleted(false);

        when(taskRepository.findById(50L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(PlannerTask.class))).thenAnswer(i -> i.getArgument(0));

        var res = plannerService.toggleTaskCompletion(50L, testUser);
        assertTrue(res.getIsCompleted());
    }

    @Test
    void applyTemplate_createsStructuredChecklist() {
        when(taskRepository.saveAll(any())).thenAnswer(i -> i.getArgument(0));

        List<PlannerDto.TaskResponse> tasks = plannerService.applyTemplate("WEDDING", LocalDate.now().plusMonths(3), null, testUser);
        assertFalse(tasks.isEmpty());
        assertTrue(tasks.stream().anyMatch(t -> "VENUE".equals(t.getCategory())));
        assertTrue(tasks.stream().anyMatch(t -> "CATERING".equals(t.getCategory())));
        assertTrue(tasks.stream().anyMatch(t -> "EVENT_DAY".equals(t.getCategory())));
    }
}
