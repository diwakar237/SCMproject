package com.smartvenue.backend;

import com.smartvenue.backend.domain.*;
import com.smartvenue.backend.dto.VendorDto;
import com.smartvenue.backend.repository.VendorBookingRepository;
import com.smartvenue.backend.repository.VendorRepository;
import com.smartvenue.backend.repository.VendorServiceRepository;
import com.smartvenue.backend.service.NotificationService;
import com.smartvenue.backend.service.VendorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VendorServiceTest {

    @Mock
    private VendorRepository vendorRepository;

    @Mock
    private VendorServiceRepository vendorServiceRepository;

    @Mock
    private VendorBookingRepository vendorBookingRepository;

    @Mock
    private NotificationService notificationService;

    private VendorService vendorService;

    private User vendorUser;
    private User customerUser;
    private Vendor sampleVendor;

    @BeforeEach
    void setUp() {
        vendorService = new VendorService(vendorRepository, vendorServiceRepository, vendorBookingRepository, notificationService);

        vendorUser = new User();
        vendorUser.setId(10L);
        vendorUser.setEmail("vendor@demo.com");
        vendorUser.setFullName("Demo Vendor");
        vendorUser.setRole(UserRole.VENDOR);

        customerUser = new User();
        customerUser.setId(20L);
        customerUser.setEmail("customer@demo.com");
        customerUser.setFullName("Demo Customer");
        customerUser.setRole(UserRole.CUSTOMER);

        sampleVendor = new Vendor();
        sampleVendor.setId(1L);
        sampleVendor.setUser(vendorUser);
        sampleVendor.setCompanyName("Artisan Catering");
        sampleVendor.setServiceCategory("CATERING");
        sampleVendor.setCity("New York");
        sampleVendor.setBasePrice(BigDecimal.valueOf(1500.00));
        sampleVendor.setApproved(true);
    }

    @Test
    void searchVendors_returnsApprovedPage() {
        when(vendorRepository.searchApprovedVendors(any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(Collections.singletonList(sampleVendor)));

        var page = vendorService.searchVendors("CATERING", "New York", "Artisan", PageRequest.of(0, 10));
        assertEquals(1, page.getTotalElements());
        assertEquals("Artisan Catering", page.getContent().get(0).getCompanyName());
    }

    @Test
    void bookVendor_createsPendingBookingAndEmitsNotification() {
        when(vendorRepository.findById(1L)).thenReturn(Optional.of(sampleVendor));
        when(vendorBookingRepository.save(any(VendorBooking.class))).thenAnswer(invocation -> {
            VendorBooking vb = invocation.getArgument(0);
            vb.setId(100L);
            return vb;
        });

        VendorDto.VendorBookingRequest req = new VendorDto.VendorBookingRequest();
        req.setVendorId(1L);
        req.setEventDate(LocalDate.now().plusWeeks(3));
        req.setNotes("Wedding catering");

        VendorDto.VendorBookingResponse response = vendorService.bookVendor(req, customerUser);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("PENDING", response.getStatus());
        assertEquals(BigDecimal.valueOf(1500.00), response.getTotalPrice());
        verify(notificationService, times(1)).createNotification(eq(vendorUser), anyString(), anyString());
    }

    @Test
    void updateVendorBookingStatus_updatesStatusAndNotifiesCustomer() {
        VendorBooking vb = new VendorBooking();
        vb.setId(100L);
        vb.setVendor(sampleVendor);
        vb.setCustomer(customerUser);
        vb.setStatus("PENDING");

        when(vendorBookingRepository.findById(100L)).thenReturn(Optional.of(vb));
        when(vendorBookingRepository.save(any(VendorBooking.class))).thenAnswer(i -> i.getArgument(0));

        var updated = vendorService.updateVendorBookingStatus(100L, "CONFIRMED", vendorUser);
        assertEquals("CONFIRMED", updated.getStatus());
        verify(notificationService, times(1)).createNotification(eq(customerUser), contains("CONFIRMED"), anyString());
    }
}
