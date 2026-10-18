import React from 'react';
import { Building2, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-green-500" />
              <span className="font-bold text-lg text-white">
                Smart<span className="text-green-500">Venue</span>
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Smart Event Venue Booking, Planning, and Management System with Parking Assistance.
            </p>
            <div className="flex items-center gap-2 text-xs text-green-400">
              <ShieldCheck className="w-4 h-4" />
              <span>SCM Engineering Project Baseline</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/venues" className="hover:text-white transition-colors">Explore Venues</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Owner Portal</a></li>
              <li><a href="/swagger-ui" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">OpenAPI Docs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">System Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Pessimistic Locking Overlap Protection</li>
              <li>Role-Based Access Control (RBAC)</li>
              <li>Real-time Occupancy & Availability</li>
              <li>Printable Certified Receipts</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Demo Credentials</h4>
            <div className="text-xs text-gray-400 space-y-1 bg-gray-800/60 p-3 rounded-lg border border-gray-700/50">
              <div><span className="text-gray-300 font-medium">Customer:</span> customer@demo.com</div>
              <div><span className="text-gray-300 font-medium">Owner:</span> owner@demo.com</div>
              <div><span className="text-gray-300 font-medium">Admin:</span> admin@demo.com</div>
              <div className="text-gray-400 mt-1">Pass: <code className="text-green-400">Password123!</code></div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Smart Event Venue System. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with strict SCM gates & quality standards
          </p>
        </div>
      </div>
    </footer>
  );
};
