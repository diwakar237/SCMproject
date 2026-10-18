import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const NotPermittedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          403
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Access Not Permitted</h1>
        <p className="mt-2 text-sm text-slate-600">
          You do not have the required permissions to view this resource. Your current role is{' '}
          <span className="font-semibold text-slate-800">{user?.role || 'Guest'}</span>.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Go to Home
          </Link>
          <Link
            to={user?.role === 'VENUE_OWNER' ? '/owner-dashboard' : '/venues'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
          >
            View Available Actions
          </Link>
        </div>
      </div>
    </div>
  );
};
