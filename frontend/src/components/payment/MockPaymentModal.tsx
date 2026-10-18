import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { Booking, Payment } from '../../types';
import { CreditCard, CheckCircle, AlertTriangle, X, Printer, ShieldCheck } from 'lucide-react';

interface MockPaymentModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (payment: Payment) => void;
}

export const MockPaymentModal: React.FC<MockPaymentModalProps> = ({
  booking,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(booking.customerName || 'Demo Customer');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/payments/mock-charge', {
        bookingId: booking.id,
        amount: booking.totalCost,
        currency: 'USD',
        paymentMethod: 'CREDIT_CARD',
      });
      setCompletedPayment(response.data);
      onPaymentSuccess(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment simulation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Visible Mock Payment Banner */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mb-5 rounded-r">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>MOCK PAYMENT GATEWAY - NO REAL MONEY IS CHARGED</span>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            This transaction is strictly simulated for demonstration, course testing, and verification.
          </p>
        </div>

        {!completedPayment ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Checkout & Secure Payment</h3>
                <p className="text-xs text-gray-500">Booking Reference: {booking.bookingReference}</p>
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-slate-50 p-4 rounded-lg mb-5 border border-slate-200">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Venue:</span>
                <span className="font-semibold text-gray-800">{booking.venueName}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Event Date:</span>
                <span className="font-semibold text-gray-800">{booking.eventDate} ({booking.timeSlot})</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-slate-200 mt-2">
                <span>Total Amount Due:</span>
                <span className="text-green-600">${Number(booking.totalCost).toLocaleString()} USD</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Card Number (Mock)</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">CVV / CVC</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-5 h-5" />
                  {loading ? 'Simulating Secure Authorization...' : `Pay $${Number(booking.totalCost).toLocaleString()} (Mock)`}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Mock Payment Confirmed!</h3>
            <p className="text-sm text-gray-500 mb-4">
              Transaction reference: <span className="font-mono text-gray-800">{completedPayment.transactionReference}</span>
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left text-xs space-y-1 mb-5">
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt No:</span>
                <span className="font-mono font-semibold">{completedPayment.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-bold text-green-600">${Number(completedPayment.amount).toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Provider:</span>
                <span className="font-semibold">{completedPayment.paymentProvider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-bold uppercase">{completedPayment.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Timestamp:</span>
                <span>{new Date(completedPayment.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
