import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { AuthContext } from '../context/AuthContext';
import { UserRole } from '../types';

vi.mock('../api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

const renderWithAuth = (
  initialPath: string,
  user: any = null,
  allowedRoles?: UserRole[]
) => {
  const authContextValue = {
    user,
    token: user ? 'mock-jwt-token' : null,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    isCustomer: user?.role === 'CUSTOMER',
    isOwner: user?.role === 'VENUE_OWNER',
    isVendor: user?.role === 'VENDOR',
    isOrganizer: user?.role === 'EVENT_ORGANIZER',
    isAdmin: user?.role === 'ADMIN',
  };

  return render(
    <AuthContext.Provider value={authContextValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<div>Login Page Mock</div>} />
          <Route path="/not-permitted" element={<div>Access Not Permitted 403</div>} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute allowedRoles={allowedRoles}>
                <div>Secret Bookings Content</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner-dashboard"
            element={
              <ProtectedRoute allowedRoles={['VENUE_OWNER', 'ADMIN']}>
                <div>Owner Secret Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Role-Based Navigation & ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated guest to login page', () => {
    renderWithAuth('/bookings', null);
    expect(screen.getByText('Login Page Mock')).toBeInTheDocument();
  });

  it('allows authenticated customer to access bookings page', () => {
    const customerUser = {
      id: 1,
      email: 'customer@demo.com',
      fullName: 'Customer Demo',
      role: 'CUSTOMER' as UserRole,
    };

    renderWithAuth('/bookings', customerUser);
    expect(screen.getByText('Secret Bookings Content')).toBeInTheDocument();
  });

  it('blocks customer from accessing owner dashboard with 403 redirect', () => {
    const customerUser = {
      id: 1,
      email: 'customer@demo.com',
      fullName: 'Customer Demo',
      role: 'CUSTOMER' as UserRole,
    };

    renderWithAuth('/owner-dashboard', customerUser);
    expect(screen.getByText('Access Not Permitted 403')).toBeInTheDocument();
  });

  it('allows venue owner to access owner dashboard', () => {
    const ownerUser = {
      id: 2,
      email: 'owner@demo.com',
      fullName: 'Owner Demo',
      role: 'VENUE_OWNER' as UserRole,
    };

    renderWithAuth('/owner-dashboard', ownerUser);
    expect(screen.getByText('Owner Secret Dashboard')).toBeInTheDocument();
  });
});
