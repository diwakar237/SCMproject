import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { apiClient } from '../api/client';

vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('AdminDashboardPage Component', () => {
  const mockStats = {
    totalUsers: 14,
    totalVenues: 12,
    totalBookings: 25,
    totalConfirmedRevenue: 85000,
    pendingBookingsCount: 3,
    pendingVenuesCount: 1,
    pendingVendorsCount: 1,
    totalReviews: 8,
    recentAuditLogs: [
      {
        id: 1,
        actorEmail: 'admin@demo.com',
        action: 'APPROVE_VENUE',
        resourceType: 'VENUE',
        resourceId: '5',
        details: 'Approved venue for public listing',
        createdAt: '2026-10-18T10:00:00',
      },
    ],
  };

  const mockPendingVenues = [
    {
      id: 5,
      name: 'Crystal Waterfront Pavilion',
      category: 'BALLROOM',
      city: 'Miami',
      capacity: 300,
      basePricePerDay: 4200,
      description: 'Luxury waterfront pavilion with private yacht dock.',
      approved: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders real telemetry statistics from backend database', async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url === '/admin/stats') return Promise.resolve({ data: mockStats });
      if (url === '/admin/venues/pending') return Promise.resolve({ data: mockPendingVenues });
      if (url === '/admin/vendors/pending') return Promise.resolve({ data: [] });
      if (url === '/admin/users') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Executive Administration/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('14')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('$85,000')).toBeInTheDocument();
      expect(screen.getByText('APPROVE_VENUE')).toBeInTheDocument();
    });
  });

  it('allows approving pending venue submissions', async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url === '/admin/stats') return Promise.resolve({ data: mockStats });
      if (url === '/admin/venues/pending') return Promise.resolve({ data: mockPendingVenues });
      if (url === '/admin/vendors/pending') return Promise.resolve({ data: [] });
      if (url === '/admin/users') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });
    (apiClient.put as any).mockResolvedValueOnce({ data: { message: 'Approved' } });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Venue Approvals/i })).toBeInTheDocument();
    });

    const venueTab = screen.getByRole('button', { name: /Venue Approvals/i });
    fireEvent.click(venueTab);

    await waitFor(() => {
      expect(screen.getByText('Crystal Waterfront Pavilion')).toBeInTheDocument();
    });

    const approveBtn = screen.getByRole('button', { name: /Approve/i });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith('/admin/venues/5/approve');
    });
  });
});
