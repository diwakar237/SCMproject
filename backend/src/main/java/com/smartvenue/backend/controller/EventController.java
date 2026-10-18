package com.smartvenue.backend.controller;

import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.dto.EventDto;
import com.smartvenue.backend.service.AuthService;
import com.smartvenue.backend.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@Tag(name = "Event & Guest Management", description = "Organize events, manage guest lists, and track RSVPs")
public class EventController {

    private final EventService eventService;
    private final AuthService authService;

    public EventController(EventService eventService, AuthService authService) {
        this.eventService = eventService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "Get all events organized by current user")
    public ResponseEntity<List<EventDto.EventResponse>> getMyEvents() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(eventService.getUserEvents(user.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get event details and guest list by ID")
    public ResponseEntity<EventDto.EventResponse> getEventById(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(eventService.getEventById(id, user));
    }

    @PostMapping
    @Operation(summary = "Create new event")
    public ResponseEntity<EventDto.EventResponse> createEvent(@Valid @RequestBody EventDto.EventRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(eventService.createEvent(request, user));
    }

    @PostMapping("/{id}/guests")
    @Operation(summary = "Add guest to event and generate secure invitation token")
    public ResponseEntity<EventDto.GuestResponse> addGuestToEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventDto.GuestRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(eventService.addGuestToEvent(id, request, user));
    }

    @DeleteMapping("/guests/{guestId}")
    @Operation(summary = "Remove guest from event")
    public ResponseEntity<Void> deleteGuest(@PathVariable Long guestId) {
        User user = authService.getCurrentAuthenticatedUser();
        eventService.deleteGuest(guestId, user);
        return ResponseEntity.noContent().build();
    }
}
