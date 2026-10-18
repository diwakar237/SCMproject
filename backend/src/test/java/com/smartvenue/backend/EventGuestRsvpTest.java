package com.smartvenue.backend;

import com.smartvenue.backend.domain.Event;
import com.smartvenue.backend.domain.EventGuest;
import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.domain.UserRole;
import com.smartvenue.backend.dto.EventDto;
import com.smartvenue.backend.repository.BookingRepository;
import com.smartvenue.backend.repository.EventGuestRepository;
import com.smartvenue.backend.repository.EventRepository;
import com.smartvenue.backend.service.EventService;
import com.smartvenue.backend.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EventGuestRsvpTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EventGuestRepository guestRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private NotificationService notificationService;

    private EventService eventService;

    private User organizer;
    private Event sampleEvent;

    @BeforeEach
    void setUp() {
        eventService = new EventService(eventRepository, guestRepository, bookingRepository, notificationService);

        organizer = new User();
        organizer.setId(1L);
        organizer.setEmail("organizer@demo.com");
        organizer.setFullName("Demo Organizer");
        organizer.setRole(UserRole.EVENT_ORGANIZER);

        sampleEvent = new Event();
        sampleEvent.setId(10L);
        sampleEvent.setOrganizer(organizer);
        sampleEvent.setTitle("Tech Gala 2026");
        sampleEvent.setEventDate(LocalDate.now().plusMonths(1));
        sampleEvent.setLocation("Grand Horizon Ballroom, NY");
        sampleEvent.setDescription("Annual networking gala");
    }

    @Test
    void addGuest_generatesSecureInvitationToken() {
        when(eventRepository.findById(10L)).thenReturn(Optional.of(sampleEvent));
        when(guestRepository.save(any(EventGuest.class))).thenAnswer(i -> {
            EventGuest g = i.getArgument(0);
            g.setId(101L);
            return g;
        });

        EventDto.GuestRequest req = new EventDto.GuestRequest();
        req.setGuestName("John Doe");
        req.setGuestEmail("john@example.com");
        req.setPlusOnes(1);

        var res = eventService.addGuestToEvent(10L, req, organizer);

        assertNotNull(res);
        assertNotNull(res.getInvitationToken());
        assertEquals(32, res.getInvitationToken().length()); // UUID hex without hyphens
        assertEquals("PENDING", res.getRsvpStatus());
    }

    @Test
    void submitRsvp_updatesStatusWithoutExposingPrivateOrganizerData() {
        EventGuest guest = new EventGuest();
        guest.setId(101L);
        guest.setEvent(sampleEvent);
        guest.setGuestName("John Doe");
        guest.setGuestEmail("john@example.com");
        guest.setInvitationToken("token12345");
        guest.setRsvpStatus("PENDING");

        when(guestRepository.findByInvitationToken("token12345")).thenReturn(Optional.of(guest));
        when(guestRepository.save(any(EventGuest.class))).thenAnswer(i -> i.getArgument(0));

        EventDto.RsvpUpdateRequest req = new EventDto.RsvpUpdateRequest();
        req.setRsvpStatus("ATTENDING");
        req.setDietaryRequirements("Vegetarian");
        req.setPlusOnes(1);

        var publicInv = eventService.submitRsvp("token12345", req);

        assertEquals("ATTENDING", publicInv.getRsvpStatus());
        assertEquals("Vegetarian", publicInv.getDietaryRequirements());
        assertEquals(1, publicInv.getPlusOnes());
        assertEquals("Tech Gala 2026", publicInv.getEventTitle());
        // Verify notification sent to event organizer
        verify(notificationService, times(1)).createNotification(eq(organizer), contains("RSVP"), anyString());
    }
}
