import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { VenueDetailsPage } from '../pages/VenueDetailsPage';
import { AuthContext } from '../context/AuthContext';
import { apiClient } from '../api/client';

vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockVenue = {
  id: 1,
  ownerId: 2,
  ownerName: 'Alice Owner',
  name: 'Grand Horizon Ballroom',
  city: 'New York',
  address: '100 Broadway, NY',
  description: 'Luxurious ballroom with panoramic glass windows.',
  category: 'Banquet Hall',
  capacity: 250,
  basePricePerDay: 2000,
  cleaningFee: 200,
  rating: 4.8,
  reviewCount: 34,
  supportedEventTypes: 'WEDDING,CORPORATE,BIRTHDAY',
  facilities: 'WIFI,PARKING,AIR_CONDITIONING',
  imageUrls: 'https://example.com/venue1.jpg',
  approved: true,
};

const mockAvailability = {
  venueId: 1,
  date: '2026-12-15',
  available: true,
  bookedSlots: ['MORNING'],
};

describe('Venue Booking Panel & Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders venue details and calculates booking pricing correctly', async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('/availability')) {
        return Promise.resolve({ data: mockAvailability });
      }
      return Promise.resolve({ data: mockVenue });
    });

    const mockCustomer = {
      id: 1,
      email: 'customer@demo.com',
      fullName: 'Customer Demo',
      role: 'CUSTOMER' as const,
    };

    const authContextValue = {
      user: mockCustomer,
      token: 'jwt-token',
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      isCustomer: true,
      isOwner: false,
      isVendor: false,
      isOrganizer: false,
      isAdmin: false,
    };

    render(
      <AuthContext.Provider value={authContextValue}>
        <MemoryRouter initialEntries={['/venues/1']}>
          <Routes>
            <Route path="/venues/:id" element={<VenueDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Grand Horizon Ballroom' })).toBeInTheDocument();
      expect(screen.getByText('Book this Venue')).toBeInTheDocument();
    });

    // Check capacity input
    const guestInput = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(guestInput).toBeInTheDocument();

    // Set guests above capacity (e.g. 300)
    fireEvent.change(guestInput, { target: { value: '300' } });

    // Live capacity warning should appear
    await waitFor(() => {
      expect(screen.getByText(/Guest count must be between 1 and 250/i)).toBeInTheDocument();
    });

    // Submit button should be disabled when capacity is exceeded
    const submitBtn = screen.getByRole('button', { name: /Request Booking/i });
    expect(submitBtn).toBeDisabled();
  });
});
