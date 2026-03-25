// components/DonateModal.jsx (Updated)
'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import RazorpayPayment from './RazorpayPayment';

// Loader Component
const Loader = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 border-t-green-600`}
      ></div>
    </div>
  );
};

export default function DonateModal({ onClose }) {
  const [charities, setCharities] = useState([]);
  const [amount, setAmount] = useState('');
  const [selectedCharity, setSelectedCharity] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingCharities, setFetchingCharities] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  // Load charities
  useEffect(() => {
    const fetchCharities = async () => {
      setFetchingCharities(true);
      try {
        const snap = await getDocs(collection(db, 'charities'));
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCharities(list);
      } catch (error) {
        console.error('Error fetching charities:', error);
        toast.error('Failed to load charities');
      } finally {
        setFetchingCharities(false);
      }
    };

    fetchCharities();
  }, []);

  const handleProceedToPayment = () => {
    if (!amount) {
      toast.error('Please enter an amount');
      return;
    }

    if (!selectedCharity) {
      toast.error('Please select a charity');
      return;
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setAmount('');
    setSelectedCharity('');
    setShowPayment(false);
  };

  const selectedCharityName = charities.find(
    (c) => c.id === selectedCharity,
  )?.name;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-[999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative z-50">
        <div className="bg-white p-6 rounded-xl w-96 relative shadow-xl">
          <h2 className="text-xl font-bold mb-4">
            {showPayment ? 'Complete Payment' : 'Make a Donation'}
          </h2>

          {!showPayment ? (
            <>
              {/* Amount Input */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Charity Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Charity
                </label>
                {fetchingCharities ? (
                  <div className="border p-2 rounded bg-gray-50 flex justify-center items-center gap-2">
                    <Loader size="sm" />
                    <span className="text-sm text-gray-500">
                      Loading charities...
                    </span>
                  </div>
                ) : (
                  <select
                    className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={selectedCharity}
                    onChange={(e) => setSelectedCharity(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select Charity</option>
                    {charities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}

                {!fetchingCharities && charities.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    No charities available. Please try again later.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="w-full border py-2 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    fetchingCharities ||
                    charities.length === 0 ||
                    !amount ||
                    !selectedCharity
                  }
                >
                  Proceed to Pay
                </button>
              </div>

              {/* Donation Summary */}
              {amount && selectedCharity && (
                <div className="mt-4 p-3 bg-green-50 rounded text-sm">
                  <p className="text-green-800">
                    You're about to donate ₹{amount} to{' '}
                    <strong>{selectedCharityName || 'selected charity'}</strong>
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Payment Summary */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Donation Details:</p>
                <p className="font-semibold">Amount: ₹{amount}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Charity: {selectedCharityName}
                </p>
              </div>

              {/* Razorpay Payment Button */}
              <RazorpayPayment
                amount={Number(amount)}
                charityId={selectedCharity}
                charityName={selectedCharityName}
                onSuccess={handlePaymentSuccess}
                onClose={() => setShowPayment(false)}
              />

              <button
                onClick={() => setShowPayment(false)}
                className="w-full mt-3 border py-2 rounded hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
