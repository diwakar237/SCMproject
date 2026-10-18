import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { VendorsPage } from '../pages/VendorsPage';
import { AuthContext } from '../context/AuthContext';
import { apiClient } from '../api/client';

vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('VendorsPage Component', () => {
  const mockVendors = [
    {
      id: 1,
      businessName: 'Royal Gourmet Catering',
      category: 'CATERING',
      city: 'New York',
      description: 'Michelin-starred bespoke catering services for weddings and galas.',
      contactEmail: 'contact@royalgourmet.com',
      contactPhone: '555-0199',
      rating: 4.9,
      reviewCount: 38,
      approved: true,
      services: [
        { id: 101, serviceName: 'Buffet Feast Package', basePrice: 45, priceUnit: 'guest' },
      ],
    },
    {
      id: 2,
      businessName: 'Luminescent Floral & Decor',
      category: 'DECORATION',
      city: 'Boston',
      description: 'Luxury botanical floral arrangements and atmospheric table styling.',
      contactEmail: 'hello@luminescentdecor.com',
      rating: 4.8,
      reviewCount: 22,
      approved: true,
      services: [
        { id: 102, serviceName: 'Complete Ballroom Floral Installation', basePrice: 2200 },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders vendor catalog with search controls and category filters', async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      data: { content: mockVendors, totalPages: 1 },
    });

    render(
      <AuthContext.Provider
        value={{
          user: { id: 1, email: 'customer@demo.com', fullName: 'Demo Customer', role: 'CUSTOMER' },
          token: 'mock-token',
          loading: false,
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          isCustomer: true,
          isOwner: false,
          isVendor: false,
          isOrganizer: false,
          isAdmin: false,
        }}
      >
        <MemoryRouter>
          <VendorsPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Vendor Directory/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by vendor business name/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Royal Gourmet Catering')).toBeInTheDocument();
      expect(screen.getByText('Luminescent Floral & Decor')).toBeInTheDocument();
    });

    expect(screen.getByText(/Buffet Feast Package/i)).toBeInTheDocument();
  });
});
