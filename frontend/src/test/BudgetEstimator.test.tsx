import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { BudgetEstimatorPage } from '../pages/BudgetEstimatorPage';
import { AuthContext } from '../context/AuthContext';
import { apiClient } from '../api/client';

vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('BudgetEstimatorPage Component', () => {
  const mockUser = {
    id: 1,
    email: 'customer@demo.com',
    fullName: 'Demo Customer',
    role: 'CUSTOMER' as const,
  };

  const authContextValue = {
    user: mockUser,
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

  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockResolvedValue({ data: [] });
  });

  it('displays the mandatory "Estimate only, not a quotation" disclaimer', () => {
    render(
      <AuthContext.Provider value={authContextValue}>
        <MemoryRouter>
          <BudgetEstimatorPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Estimate only, not a quotation')).toBeInTheDocument();
  });

  it('performs live subtotal, contingency calculation, and budget variance detection', async () => {
    render(
      <AuthContext.Provider value={authContextValue}>
        <MemoryRouter>
          <BudgetEstimatorPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Initial state: Limit 10000, items total 9000 (3500+2500+1200+800+600+400), 10% contingency = 900, total = 9900
    expect(screen.getByText('$9,000')).toBeInTheDocument();
    expect(screen.getByText('$9,900')).toBeInTheDocument();
    expect(screen.getByText(/Under Budget/i)).toBeInTheDocument();

    // Now lower budget target to 5000 to trigger over-budget state
    const limitInput = screen.getByDisplayValue('10000');
    fireEvent.change(limitInput, { target: { value: '5000' } });

    await waitFor(() => {
      expect(screen.getByText(/Over Budget Warning/i)).toBeInTheDocument();
      expect(screen.getByText(/Estimated costs exceed target by \$4,900/i)).toBeInTheDocument();
    });
  });

  it('saves budget to backend API successfully', async () => {
    (apiClient.post as any).mockResolvedValueOnce({
      data: {
        id: 101,
        eventTitle: 'My Grand Event',
        totalLimit: 10000,
        totalEstimatedCost: 9900,
        isOverBudget: false,
      },
    });

    render(
      <AuthContext.Provider value={authContextValue}>
        <MemoryRouter>
          <BudgetEstimatorPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const saveButton = screen.getByRole('button', { name: /Save Budget to Account/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/budgets', expect.objectContaining({
        eventTitle: 'My Grand Event',
        totalLimit: 10000,
        contingencyPercent: 10,
      }));
      expect(screen.getByText(/saved successfully!/i)).toBeInTheDocument();
    });
  });
});
