import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PublicRsvpPage } from '../pages/PublicRsvpPage';
import { apiClient } from '../api/client';

vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('PublicRsvpPage Component', () => {
  const mockInvitation = {
    invitationToken: 'test-rsvp-token-123',
    eventTitle: 'Emma & Noah Gala Evening',
    description: 'An elegant reception under the stars.',
    eventType: 'GALA',
    eventDate: '2026-12-10',
    startTime: '18:00',
    locationName: 'Skyline Penthouse Terrace',
    locationAddress: '500 5th Avenue, New York, NY',
    dressCode: 'Black Tie Optional',
    guestName: 'Alex Rivera',
    guestEmail: 'alex.rivera@example.com',
    rsvpStatus: 'PENDING',
    plusOnes: 0,
    dietaryRequirements: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders invitation details securely without leaking organizer credentials', async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      data: mockInvitation,
    });

    render(
      <MemoryRouter initialEntries={['/rsvp/test-rsvp-token-123']}>
        <Routes>
          <Route path="/rsvp/:token" element={<PublicRsvpPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Emma & Noah Gala Evening')).toBeInTheDocument();
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
      expect(screen.getByText(/Skyline Penthouse Terrace/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Yes, Attending/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Regretfully Decline/i })).toBeInTheDocument();
    });
  });

  it('submits RSVP confirmation to backend', async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      data: mockInvitation,
    });
    (apiClient.post as any).mockResolvedValueOnce({
      data: { ...mockInvitation, rsvpStatus: 'ATTENDING' },
    });

    render(
      <MemoryRouter initialEntries={['/rsvp/test-rsvp-token-123']}>
        <Routes>
          <Route path="/rsvp/:token" element={<PublicRsvpPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Emma & Noah Gala Evening')).toBeInTheDocument();
    });

    const attendingBtn = screen.getByRole('button', { name: /Yes, Attending/i });
    fireEvent.click(attendingBtn);

    const submitBtn = screen.getByRole('button', { name: /Confirm RSVP/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/rsvp/test-rsvp-token-123',
        expect.objectContaining({
          rsvpStatus: 'ATTENDING',
        })
      );
    });
  });
});
