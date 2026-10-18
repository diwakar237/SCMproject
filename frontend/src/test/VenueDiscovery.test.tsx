import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { VenueDiscoveryPage } from '../pages/VenueDiscoveryPage';
import { apiClient } from '../api/client';

vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockVenues = [
  {
    id: 1,
    name: 'Grand Horizon Ballroom',
    city: 'New York',
    address: '100 Broadway, NY',
    description: 'Luxurious ballroom with panoramic glass windows.',
    category: 'Banquet Hall',
    capacity: 500,
    basePricePerDay: 2500,
    cleaningFee: 200,
    rating: 4.8,
    reviewCount: 34,
    supportedEventTypes: 'WEDDING,CORPORATE',
    facilities: 'WIFI,PARKING,AIR_CONDITIONING',
    imageUrls: 'https://example.com/venue1.jpg',
    approved: true,
  },
  {
    id: 2,
    name: 'Skyline Terrace & Lounge',
    city: 'Chicago',
    address: '200 Michigan Ave, Chicago',
    description: 'Chic rooftop overlooking the city skyline.',
    category: 'Rooftop',
    capacity: 150,
    basePricePerDay: 1800,
    cleaningFee: 150,
    rating: 4.6,
    reviewCount: 22,
    supportedEventTypes: 'CORPORATE,BIRTHDAY',
    facilities: 'WIFI,AUDIO_VISUAL',
    imageUrls: 'https://example.com/venue2.jpg',
    approved: true,
  },
];

describe('Venue Discovery & Filter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search and filter controls', async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      data: {
        content: mockVenues,
        totalElements: 2,
        totalPages: 1,
        number: 0,
        size: 12,
      },
    });

    render(
      <MemoryRouter initialEntries={['/venues']}>
        <VenueDiscoveryPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Explore Event Venues/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. Ballroom, Resort\.\.\./i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Grand Horizon Ballroom')).toBeInTheDocument();
      expect(screen.getByText('Skyline Terrace & Lounge')).toBeInTheDocument();
    });
  });

  it('handles venue comparison selection', async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      data: {
        content: mockVenues,
        totalElements: 2,
        totalPages: 1,
        number: 0,
        size: 12,
      },
    });

    render(
      <MemoryRouter initialEntries={['/venues']}>
        <VenueDiscoveryPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Grand Horizon Ballroom')).toBeInTheDocument();
    });

    // Find compare buttons by title
    const compareButtons = screen.getAllByTitle('Compare venue');
    expect(compareButtons.length).toBeGreaterThan(0);

    // Toggle first venue comparison
    fireEvent.click(compareButtons[0]);

    // Comparison drawer should become visible
    await waitFor(() => {
      expect(screen.getByText(/Open Comparison/i)).toBeInTheDocument();
    });
  });
});
