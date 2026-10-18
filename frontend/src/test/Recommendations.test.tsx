import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { RecommendationsPage } from '../pages/RecommendationsPage';
import { apiClient } from '../api/client';
import { RecommendationResult } from '../types';

vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockRecommendationResponse: RecommendationResult[] = [
  {
    venue: {
      id: 1,
      ownerId: 2,
      ownerName: 'Alice Owner',
      name: 'Grand Horizon Ballroom',
      city: 'New York',
      address: '100 Broadway, NY',
      description: 'Luxurious ballroom with panoramic glass windows.',
      category: 'Banquet Hall',
      capacity: 350,
      basePricePerDay: 3000,
      cleaningFee: 200,
      rating: 4.8,
      reviewCount: 34,
      supportedEventTypes: 'WEDDING,CORPORATE',
      facilities: 'WIFI,PARKING',
      imageUrls: 'https://example.com/venue1.jpg',
      approved: true,
    },
    scoreBreakdown: {
      overallScore: 92.5,
      budgetScore: 95.0,
      locationScore: 100.0,
      capacityScore: 90.0,
      eventTypeScore: 100.0,
      facilitiesScore: 100.0,
      availabilityScore: 40.0,
    },
    plainExplanation: 'Highly recommended (92.5/100). Outstanding budget fit (under $3,500 limit). Located in New York with capacity for 350 guests.',
    matchingHighlights: ['Within Budget', 'Matches City', 'Ample Capacity', 'Supports WEDDING', 'All Requested Facilities Present'],
  },
];

describe('RecommendationsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders recommendation form inputs with defaults', () => {
    render(
      <MemoryRouter>
        <RecommendationsPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /AI-Assisted Venue Recommendations/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Expected Guests/i)).toHaveValue(150);
    expect(screen.getByLabelText(/Max Budget/i)).toHaveValue(3500);
  });

  it('queries recommendations and displays ranked score breakdown and explanation', async () => {
    (apiClient.post as any).mockResolvedValueOnce({ data: mockRecommendationResponse });

    render(
      <MemoryRouter>
        <RecommendationsPage />
      </MemoryRouter>
    );

    const searchButton = screen.getByRole('button', { name: /Calculate Recommendations/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/recommendations', expect.objectContaining({
        guestCount: 150,
        maxBudget: 3500,
      }));
      expect(screen.getByText('Grand Horizon Ballroom')).toBeInTheDocument();
      expect(screen.getByText('92.5')).toBeInTheDocument();
      expect(screen.getByText(/Highly recommended \(92.5\/100\)/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no venues meet hard constraints', async () => {
    (apiClient.post as any).mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <RecommendationsPage />
      </MemoryRouter>
    );

    const searchButton = screen.getByRole('button', { name: /Calculate Recommendations/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/No Venues Match Hard Constraints/i)).toBeInTheDocument();
    });
  });
});
