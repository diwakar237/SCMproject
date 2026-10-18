import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          404
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Page Not Found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            to="/"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
