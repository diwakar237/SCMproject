import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ParkingSection } from '../components/parking/ParkingSection';
import { AuthContext } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { ParkingLot, ParkingPrediction } from '../types';

vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));


const mockLots: ParkingLot[] = [
  {
    id: 1,
    venueId: 10,
    lotName: 'North VIP Deck',
    totalSpots: 100,
    occupiedSpots: 40,
    availableSpots: 60,
    occupancyPercent: 40,
    dataSource: 'SENSOR',
    lastUpdatedAt: '2026-10-18T10:00:00',
    suggestedArrivalWindow: 'Arrive 15-30 minutes before event start. Normal flow expected.',
    recentHistory: [
      {
        id: 1,
        occupiedSpots: 40,
        dataSource: 'SENSOR',
        recordedAt: '2026-10-18T10:00:00',
      },
    ],
  },
];

const mockPrediction: ParkingPrediction = {
  lotId: 1,
  lotName: 'North VIP Deck',
  totalSpots: 100,
  predictedOccupiedSpots: 75,
  predictedAvailableSpots: 25,
  predictedOccupancyPercent: 75,
  dataSource: 'PREDICTED',
  predictionBasis: 'Historical average (50%) + scheduled confirmed events load factor (1.5x)',
  suggestedArrivalWindow: 'Arrive 30-45 minutes before event start. Moderate congestion expected.',
};

describe('ParkingSection Component', () => {
  const authContextValue = {
    user: { id: 1, email: 'owner@demo.com', fullName: 'Demo Owner', role: 'VENUE_OWNER' as const },
    token: 'jwt-token',
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    isCustomer: false,
    isOwner: true,
    isVendor: false,
    isOrganizer: false,
    isAdmin: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders live parking occupancy formulas and source badge correctly', async () => {
    (apiClient.get as any).mockResolvedValueOnce({ data: mockLots });

    render(
      <AuthContext.Provider value={authContextValue}>
        <ParkingSection venueId={10} isOwnerOrAdmin={true} />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('North VIP Deck')).toBeInTheDocument();
      expect(screen.getByText('LIVE SENSOR')).toBeInTheDocument();
      expect(screen.getByText('40%')).toBeInTheDocument(); // occupancy percent
      expect(screen.getByText('60')).toBeInTheDocument(); // available spots
      expect(screen.getByText(/Arrive 15-30 minutes before event start/i)).toBeInTheDocument();
    });
  });

  it('queries parking prediction and renders distinctly styled forecast card', async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('/prediction')) {
        return Promise.resolve({ data: mockPrediction });
      }
      return Promise.resolve({ data: mockLots });
    });

    render(
      <AuthContext.Provider value={authContextValue}>
        <ParkingSection venueId={10} isOwnerOrAdmin={true} />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('North VIP Deck')).toBeInTheDocument();
    });

    // Click forecast accordion
    const forecastButton = screen.getByText(/Forecast Future Event Parking/i);
    fireEvent.click(forecastButton);

    const calcButton = screen.getByRole('button', { name: /Calculate Forecast/i });
    fireEvent.click(calcButton);

    await waitFor(() => {
      expect(screen.getByText(/75% Expected Occupancy/i)).toBeInTheDocument();
      expect(screen.getByText('75 spots')).toBeInTheDocument();
      expect(screen.getByText('25 spots')).toBeInTheDocument();
      expect(screen.getByText('PREDICTED')).toBeInTheDocument();
    });
  });
});
