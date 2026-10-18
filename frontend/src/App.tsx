import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { VenueDiscoveryPage } from './pages/VenueDiscoveryPage';
import { VenueDetailsPage } from './pages/VenueDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { NotPermittedPage } from './pages/NotPermittedPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/venues" element={<VenueDiscoveryPage />} />
              <Route path="/venues/:id" element={<VenueDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/not-permitted" element={<NotPermittedPage />} />

              {/* Protected Routes: Bookings */}
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes: Owner Dashboard */}
              <Route
                path="/owner"
                element={
                  <ProtectedRoute allowedRoles={['VENUE_OWNER', 'ADMIN']}>
                    <OwnerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['VENUE_OWNER', 'ADMIN']}>
                    <OwnerDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-All */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
