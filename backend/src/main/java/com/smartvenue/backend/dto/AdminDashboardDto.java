package com.smartvenue.backend.dto;

import com.smartvenue.backend.domain.AuditLog;
import com.smartvenue.backend.domain.User;
import com.smartvenue.backend.domain.UserRole;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AdminDashboardDto {

    public static class DashboardStats {
        private long totalUsers;
        private long totalVenues;
        private long pendingVenueApprovals;
        private long totalVendors;
        private long pendingVendorApprovals;
        private long totalBookings;
        private long confirmedBookings;
        private BigDecimal totalRevenue;
        private Map<String, Long> usersByRole;
        private List<AuditLog> recentAuditLogs;

        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

        public long getTotalVenues() { return totalVenues; }
        public void setTotalVenues(long totalVenues) { this.totalVenues = totalVenues; }

        public long getPendingVenueApprovals() { return pendingVenueApprovals; }
        public void setPendingVenueApprovals(long pendingVenueApprovals) { this.pendingVenueApprovals = pendingVenueApprovals; }

        public long getTotalVendors() { return totalVendors; }
        public void setTotalVendors(long totalVendors) { this.totalVendors = totalVendors; }

        public long getPendingVendorApprovals() { return pendingVendorApprovals; }
        public void setPendingVendorApprovals(long pendingVendorApprovals) { this.pendingVendorApprovals = pendingVendorApprovals; }

        public long getTotalBookings() { return totalBookings; }
        public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }

        public long getConfirmedBookings() { return confirmedBookings; }
        public void setConfirmedBookings(long confirmedBookings) { this.confirmedBookings = confirmedBookings; }

        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public BigDecimal getTotalConfirmedRevenue() { return totalRevenue != null ? totalRevenue : BigDecimal.ZERO; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

        public Map<String, Long> getUsersByRole() { return usersByRole; }
        public void setUsersByRole(Map<String, Long> usersByRole) { this.usersByRole = usersByRole; }

        public List<AuditLog> getRecentAuditLogs() { return recentAuditLogs; }
        public void setRecentAuditLogs(List<AuditLog> recentAuditLogs) { this.recentAuditLogs = recentAuditLogs; }
    }

    public static class UserSummaryResponse {
        private Long id;
        private String email;
        private String fullName;
        private String role;
        private String phone;
        private LocalDateTime createdAt;

        public static UserSummaryResponse fromEntity(User u) {
            UserSummaryResponse res = new UserSummaryResponse();
            res.id = u.getId();
            res.email = u.getEmail();
            res.fullName = u.getFullName();
            res.role = u.getRole().name();
            res.phone = u.getPhone();
            res.createdAt = u.getCreatedAt();
            return res;
        }

        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getFullName() { return fullName; }
        public String getRole() { return role; }
        public String getPhone() { return phone; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }
}
