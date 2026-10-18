package com.smartvenue.backend.dto;

import com.smartvenue.backend.domain.Event;
import com.smartvenue.backend.domain.EventGuest;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class EventDto {

    public static class EventRequest {
        private Long bookingId;

        @NotBlank(message = "Event title is required")
        private String title;

        @NotNull(message = "Event date is required")
        private LocalDate eventDate;

        private String location;
        private String locationName;
        private String locationAddress;
        private String eventType;
        private String startTime;
        private String dressCode;
        private String description;

        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public LocalDate getEventDate() { return eventDate; }
        public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }

        public String getLocation() {
            if (location != null && !location.isBlank()) return location;
            if (locationName != null && !locationName.isBlank()) {
                return (locationAddress != null && !locationAddress.isBlank()) ? locationName + ", " + locationAddress : locationName;
            }
            if (locationAddress != null && !locationAddress.isBlank()) return locationAddress;
            return "TBD";
        }
        public void setLocation(String location) { this.location = location; }

        public String getLocationName() { return locationName; }
        public void setLocationName(String locationName) { this.locationName = locationName; }

        public String getLocationAddress() { return locationAddress; }
        public void setLocationAddress(String locationAddress) { this.locationAddress = locationAddress; }

        public String getEventType() { return eventType; }
        public void setEventType(String eventType) { this.eventType = eventType; }

        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }

        public String getDressCode() { return dressCode; }
        public void setDressCode(String dressCode) { this.dressCode = dressCode; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class GuestRequest {
        @NotBlank(message = "Guest name is required")
        private String guestName;

        @NotBlank(message = "Guest email is required")
        @Email(message = "Invalid email format")
        private String guestEmail;

        private String dietaryRequirements;

        private Integer plusOnes = 0;

        public String getGuestName() { return guestName; }
        public void setGuestName(String guestName) { this.guestName = guestName; }

        public String getGuestEmail() { return guestEmail; }
        public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }

        public String getDietaryRequirements() { return dietaryRequirements; }
        public void setDietaryRequirements(String dietaryRequirements) { this.dietaryRequirements = dietaryRequirements; }

        public Integer getPlusOnes() { return plusOnes; }
        public void setPlusOnes(Integer plusOnes) { this.plusOnes = plusOnes; }
    }

    public static class RsvpUpdateRequest {
        @NotBlank(message = "RSVP status is required (ATTENDING, DECLINED)")
        private String rsvpStatus;

        private String dietaryRequirements;

        private Integer plusOnes = 0;

        public String getRsvpStatus() { return rsvpStatus; }
        public void setRsvpStatus(String rsvpStatus) { this.rsvpStatus = rsvpStatus; }

        public String getDietaryRequirements() { return dietaryRequirements; }
        public void setDietaryRequirements(String dietaryRequirements) { this.dietaryRequirements = dietaryRequirements; }

        public Integer getPlusOnes() { return plusOnes; }
        public void setPlusOnes(Integer plusOnes) { this.plusOnes = plusOnes; }
    }

    public static class GuestResponse {
        private Long id;
        private Long eventId;
        private String guestName;
        private String guestEmail;
        private String invitationToken;
        private String rsvpStatus;
        private String dietaryRequirements;
        private Integer plusOnes;
        private LocalDateTime updatedAt;

        public static GuestResponse fromEntity(EventGuest g) {
            GuestResponse res = new GuestResponse();
            res.id = g.getId();
            res.eventId = g.getEvent().getId();
            res.guestName = g.getGuestName();
            res.guestEmail = g.getGuestEmail();
            res.invitationToken = g.getInvitationToken();
            res.rsvpStatus = g.getRsvpStatus();
            res.dietaryRequirements = g.getDietaryRequirements();
            res.plusOnes = g.getPlusOnes();
            res.updatedAt = g.getUpdatedAt();
            return res;
        }

        public Long getId() { return id; }
        public Long getEventId() { return eventId; }
        public String getGuestName() { return guestName; }
        public String getGuestEmail() { return guestEmail; }
        public String getInvitationToken() { return invitationToken; }
        public String getRsvpStatus() { return rsvpStatus; }
        public String getDietaryRequirements() { return dietaryRequirements; }
        public Integer getPlusOnes() { return plusOnes; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
    }

    public static class PublicInvitationResponse {
        private String eventTitle;
        private LocalDate eventDate;
        private String location;
        private String description;
        private String guestName;
        private String rsvpStatus;
        private String dietaryRequirements;
        private Integer plusOnes;

        public static PublicInvitationResponse fromGuest(EventGuest g) {
            PublicInvitationResponse res = new PublicInvitationResponse();
            res.eventTitle = g.getEvent().getTitle();
            res.eventDate = g.getEvent().getEventDate();
            res.location = g.getEvent().getLocation();
            res.description = g.getEvent().getDescription();
            res.guestName = g.getGuestName();
            res.rsvpStatus = g.getRsvpStatus();
            res.dietaryRequirements = g.getDietaryRequirements();
            res.plusOnes = g.getPlusOnes();
            return res;
        }

        public String getEventTitle() { return eventTitle; }
        public LocalDate getEventDate() { return eventDate; }
        public String getLocation() { return location; }
        public String getDescription() { return description; }
        public String getGuestName() { return guestName; }
        public String getRsvpStatus() { return rsvpStatus; }
        public String getDietaryRequirements() { return dietaryRequirements; }
        public Integer getPlusOnes() { return plusOnes; }
    }

    public static class EventResponse {
        private Long id;
        private Long organizerId;
        private String organizerName;
        private Long bookingId;
        private String title;
        private LocalDate eventDate;
        private String location;
        private String description;
        private LocalDateTime createdAt;
        private List<GuestResponse> guests;
        private Integer totalGuests;
        private Integer attendingCount;

        public static EventResponse fromEntity(Event e) {
            EventResponse res = new EventResponse();
            res.id = e.getId();
            res.organizerId = e.getOrganizer().getId();
            res.organizerName = e.getOrganizer().getFullName();
            if (e.getBooking() != null) {
                res.bookingId = e.getBooking().getId();
            }
            res.title = e.getTitle();
            res.eventDate = e.getEventDate();
            res.location = e.getLocation();
            res.description = e.getDescription();
            res.createdAt = e.getCreatedAt();
            if (e.getGuests() != null) {
                res.guests = e.getGuests().stream()
                        .map(GuestResponse::fromEntity)
                        .collect(Collectors.toList());
                res.totalGuests = e.getGuests().size();
                res.attendingCount = (int) e.getGuests().stream()
                        .filter(g -> "ATTENDING".equalsIgnoreCase(g.getRsvpStatus()))
                        .count();
            }
            return res;
        }

        public Long getId() { return id; }
        public Long getOrganizerId() { return organizerId; }
        public String getOrganizerName() { return organizerName; }
        public Long getBookingId() { return bookingId; }
        public String getTitle() { return title; }
        public LocalDate getEventDate() { return eventDate; }
        public String getLocation() { return location; }
        public String getLocationName() { return location; }
        public String getLocationAddress() { return location; }
        public String getStartTime() { return "18:00"; }
        public String getEventType() { return "GENERAL"; }
        public String getDressCode() { return "Formal"; }
        public String getDescription() { return description; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public List<GuestResponse> getGuests() { return guests; }
        public Integer getTotalGuests() { return totalGuests; }
        public Integer getAttendingCount() { return attendingCount; }
    }
}
