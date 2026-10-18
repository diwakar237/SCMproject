package com.smartvenue.backend.service;

import com.smartvenue.backend.domain.Booking;
import com.smartvenue.backend.domain.Event;
import com.smartvenue.backend.domain.EventGuest;
import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.dto.EventDto;
import com.smartvenue.backend.exception.Exceptions;
import com.smartvenue.backend.repository.BookingRepository;
import com.smartvenue.backend.repository.EventGuestRepository;
import com.smartvenue.backend.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventGuestRepository guestRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    public EventService(EventRepository eventRepository,
                        EventGuestRepository guestRepository,
                        BookingRepository bookingRepository,
                        NotificationService notificationService) {
        this.eventRepository = eventRepository;
        this.guestRepository = guestRepository;
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<EventDto.EventResponse> getUserEvents(Long userId) {
        return eventRepository.findByOrganizerIdOrderByEventDateAsc(userId)
                .stream()
                .map(EventDto.EventResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventDto.EventResponse getEventById(Long eventId, User user) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Event not found with ID: " + eventId));

        if (!event.getOrganizer().getId().equals(user.getId()) && user.getRole() != com.smartvenue.backend.domain.UserRole.ADMIN) {
            throw new Exceptions.ForbiddenException("You do not have access to this event.");
        }

        return EventDto.EventResponse.fromEntity(event);
    }

    @Transactional
    public EventDto.EventResponse createEvent(EventDto.EventRequest request, User organizer) {
        Booking booking = null;
        if (request.getBookingId() != null) {
            booking = bookingRepository.findById(request.getBookingId()).orElse(null);
        }

        Event event = new Event();
        event.setOrganizer(organizer);
        event.setBooking(booking);
        event.setTitle(request.getTitle());
        event.setEventDate(request.getEventDate());
        event.setLocation(request.getLocation());
        event.setDescription(request.getDescription());

        Event saved = eventRepository.save(event);
        return EventDto.EventResponse.fromEntity(saved);
    }

    @Transactional
    public EventDto.GuestResponse addGuestToEvent(Long eventId, EventDto.GuestRequest request, User user) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Event not found with ID: " + eventId));

        if (!event.getOrganizer().getId().equals(user.getId()) && user.getRole() != com.smartvenue.backend.domain.UserRole.ADMIN) {
            throw new Exceptions.ForbiddenException("You do not have permission to manage guests for this event.");
        }

        // Generate secure 32-character hex token
        String token = UUID.randomUUID().toString().replace("-", "");

        EventGuest guest = new EventGuest();
        guest.setEvent(event);
        guest.setGuestName(request.getGuestName());
        guest.setGuestEmail(request.getGuestEmail().toLowerCase().trim());
        guest.setInvitationToken(token);
        guest.setRsvpStatus("PENDING");
        guest.setDietaryRequirements(request.getDietaryRequirements());
        guest.setPlusOnes(request.getPlusOnes() != null ? request.getPlusOnes() : 0);

        EventGuest saved = guestRepository.save(guest);
        return EventDto.GuestResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteGuest(Long guestId, User user) {
        EventGuest guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Guest not found with ID: " + guestId));

        if (!guest.getEvent().getOrganizer().getId().equals(user.getId()) && user.getRole() != com.smartvenue.backend.domain.UserRole.ADMIN) {
            throw new Exceptions.ForbiddenException("You do not have permission to delete this guest.");
        }

        guestRepository.delete(guest);
    }

    // Public Invitation by secure token
    @Transactional(readOnly = true)
    public EventDto.PublicInvitationResponse getPublicInvitation(String token) {
        EventGuest guest = guestRepository.findByInvitationToken(token)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Invitation link is invalid or expired."));
        return EventDto.PublicInvitationResponse.fromGuest(guest);
    }

    // Public RSVP Submission by secure token
    @Transactional
    public EventDto.PublicInvitationResponse submitRsvp(String token, EventDto.RsvpUpdateRequest request) {
        EventGuest guest = guestRepository.findByInvitationToken(token)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Invitation link is invalid or expired."));

        String status = request.getRsvpStatus().trim().toUpperCase();
        if (!"ATTENDING".equals(status) && !"DECLINED".equals(status)) {
            throw new Exceptions.ValidationException("Invalid RSVP status. Must be ATTENDING or DECLINED.");
        }

        guest.setRsvpStatus(status);
        if (request.getDietaryRequirements() != null) {
            guest.setDietaryRequirements(request.getDietaryRequirements());
        }
        if (request.getPlusOnes() != null) {
            guest.setPlusOnes(Math.max(0, request.getPlusOnes()));
        }
        guest.setUpdatedAt(LocalDateTime.now());

        EventGuest saved = guestRepository.save(guest);

        // Notify event organizer
        notificationService.createNotification(
                saved.getEvent().getOrganizer(),
                "Guest RSVP Received",
                saved.getGuestName() + " has responded: " + status + " for " + saved.getEvent().getTitle()
        );

        return EventDto.PublicInvitationResponse.fromGuest(saved);
    }
}
