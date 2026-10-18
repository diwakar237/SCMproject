import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MockPaymentModal } from '../components/payment/MockPaymentModal';
import { Booking } from '../types';
import { apiClient } from '../api/client';

vi.mock('../api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('MockPaymentModal Component', () => {
  const mockBooking: Booking = {
    id: 10,
    bookingReference: 'BK-2026-TEST',
    venueId: 1,
    venueName: 'Grand Horizon Ballroom',
    venueCity: 'New York',
    customerId: 5,
    customerName: 'Demo Customer',
    customerEmail: 'customer@demo.com',
    eventDate: '2026-11-20',
    timeSlot: 'FULL_DAY',
    eventType: 'WEDDING',
    guestCount: 150,
    baseCost: 3500,
    serviceFee: 350,
    totalCost: 3850,
    status: 'CONFIRMED',
    createdAt: '2026-10-18T10:00:00',
    updatedAt: '2026-10-18T10:00:00',
  };

  const mockPaymentResult = {
    id: 101,
    bookingId: 10,
    bookingReference: 'BK-2026-TEST',
    venueName: 'Grand Horizon Ballroom',
    userId: 5,
    userEmail: 'customer@demo.com',
    amount: 3850,
    currency: 'USD',
    status: 'COMPLETED',
    paymentMethod: 'CREDIT_CARD',
    paymentProvider: 'MOCK_STRIPE_GATEWAY',
    transactionReference: 'TX-MOCK-99887766',
    receiptNumber: 'RCP-MOCK-112233',
    createdAt: '2026-10-18T10:05:00',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders prominent MOCK PAYMENT banner and cost breakdown', () => {
    render(
      <MockPaymentModal
        booking={mockBooking}
        isOpen={true}
        onClose={vi.fn()}
        onPaymentSuccess={vi.fn()}
      />
    );

    // Requirement: Must have a visible "MOCK PAYMENT, no real money" banner
    expect(
      screen.getByText(/MOCK PAYMENT GATEWAY - NO REAL MONEY IS CHARGED/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Grand Horizon Ballroom')).toBeInTheDocument();
    expect(screen.getByText('$3,850 USD')).toBeInTheDocument();
  });

  it('submits simulated mock payment and shows confirmation receipt', async () => {
    (apiClient.post as any).mockResolvedValueOnce({
      data: mockPaymentResult,
    });

    const handleSuccess = vi.fn();

    render(
      <MockPaymentModal
        booking={mockBooking}
        isOpen={true}
        onClose={vi.fn()}
        onPaymentSuccess={handleSuccess}
      />
    );

    const payBtn = screen.getByRole('button', { name: /Pay \$3,850/i });
    fireEvent.click(payBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/payments/mock-charge',
        expect.objectContaining({
          bookingId: 10,
          amount: 3850,
          currency: 'USD',
        })
      );
      expect(handleSuccess).toHaveBeenCalledWith(mockPaymentResult);
      expect(screen.getByText(/Mock Payment Confirmed!/i)).toBeInTheDocument();
      expect(screen.getByText('TX-MOCK-99887766')).toBeInTheDocument();
      expect(screen.getByText('RCP-MOCK-112233')).toBeInTheDocument();
    });
  });
});
