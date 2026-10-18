package com.smartvenue.backend.controller;

import com.smartvenue.backend.dto.EventDto;
import com.smartvenue.backend.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rsvp")
@Tag(name = "Guest RSVP Portal", description = "Public guest invitation access and attendance response without exposing private data")
public class RsvpController {

    private final EventService eventService;

    public RsvpController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping("/{token}")
    @Operation(summary = "View public event invitation card using secure token")
    public ResponseEntity<EventDto.PublicInvitationResponse> getInvitation(@PathVariable String token) {
        return ResponseEntity.ok(eventService.getPublicInvitation(token));
    }

    @PostMapping("/{token}")
    @Operation(summary = "Submit guest RSVP status and dietary preferences")
    public ResponseEntity<EventDto.PublicInvitationResponse> submitRsvp(
            @PathVariable String token,
            @Valid @RequestBody EventDto.RsvpUpdateRequest request) {
        return ResponseEntity.ok(eventService.submitRsvp(token, request));
    }
}
