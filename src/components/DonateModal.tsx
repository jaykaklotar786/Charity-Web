'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { toast } from 'sonner';
import Loader from '@/components/Loader';
import RazorpayPayment from './RazorpayPayment';

interface Charity {
  id: string;
  name: string;
  createdAt?: Timestamp;
}

interface DonateModalProps {
  onClose: () => void;
}

export default function DonateModal({ onClose }: DonateModalProps) {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [selectedCharity, setSelectedCharity] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingCharities, setFetchingCharities] = useState<boolean>(true);
  const [showPayment, setShowPayment] = useState<boolean>(false);

  useEffect(() => {
    const fetchCharities = async (): Promise<void> => {
      setFetchingCharities(true);
      try {
        const snap = await getDocs(collection(db, 'charities'));
        const list: Charity[] = snap.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data(),
          }),
        ) as Charity[];
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

  const handleProceedToPayment = (): void => {
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

  const handlePaymentSuccess = (): void => {
    setAmount('');
    setSelectedCharity('');
    setShowPayment(false);
    toast.success('Donation completed successfully! 🎉');
  };

  const selectedCharityName: string | undefined = charities.find(
    (c: Charity) => c.id === selectedCharity,
  )?.name;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !showPayment && !loading) {
      handleProceedToPayment();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-[999]"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative z-50">
        <div className="bg-white p-6 rounded-xl w-96 relative shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {showPayment ? 'Complete Payment' : 'Make a Donation'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {!showPayment ? (
            <>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  value={amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAmount(e.target.value)
                  }
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Charity
                </label>
                {fetchingCharities ? (
                  <div className="border border-gray-300 p-2 rounded-lg bg-gray-50 flex justify-center items-center gap-2">
                    <Loader size="sm" />
                    <span className="text-sm text-gray-500">
                      Loading charities...
                    </span>
                  </div>
                ) : (
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={selectedCharity}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setSelectedCharity(e.target.value)
                    }
                    disabled={loading}
                  >
                    <option value="">Select Charity</option>
                    {charities.map((c: Charity) => (
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

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 border border-gray-300 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToPayment}
                  className="flex-1 bg-linear-to-r from-green-600 to-green-500 text-white py-2.5 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

              {amount && selectedCharity && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-800 text-sm">
                    You&apos;re about to donate <strong>₹{amount}</strong> to{' '}
                    <strong>{selectedCharityName || 'selected charity'}</strong>
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Donation Details:</p>
                <p className="font-semibold text-gray-900">Amount: ₹{amount}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Charity: {selectedCharityName}
                </p>
              </div>

              <RazorpayPayment
                amount={Number(amount)}
                charityId={selectedCharity}
                charityName={selectedCharityName || ''}
                onSuccess={handlePaymentSuccess}
                onClose={() => setShowPayment(false)}
              />

              <button
                onClick={() => setShowPayment(false)}
                className="w-full mt-3 border border-gray-300 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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
