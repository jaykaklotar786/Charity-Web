'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { toast } from 'sonner';

// Define types
interface Donation {
  id: string;
  amount: number;
  charityId: string;
  userId?: string;
  userEmail?: string;
  createdAt?: Date | null;
  paymentId?: string;
  orderId?: string;
  status?: string;
}

interface CharitiesMap {
  [key: string]: string;
}

// Loader Component
const Loader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 border-t-green-600`}
      ></div>
    </div>
  );
};

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [charities, setCharities] = useState<CharitiesMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [fetching, setFetching] = useState<boolean>(false);

  const fetchData = async (): Promise<void> => {
    try {
      setFetching(true);
      setLoading(true);

      const donationsQuery = query(
        collection(db, 'donations'),
        orderBy('createdAt', 'desc'),
      );

      const dSnap = await getDocs(donationsQuery);

      const dList: Donation[] = dSnap.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          return {
            id: doc.id,
            amount: data.amount || 0,
            charityId: data.charityId || '',
            userId: data.userId,
            userEmail: data.userEmail,
            createdAt: data.createdAt?.toDate?.() || null,
            paymentId: data.paymentId,
            orderId: data.orderId,
            status: data.status,
          };
        },
      );

      setDonations(dList);

      const cSnap = await getDocs(collection(db, 'charities'));
      const cMap: CharitiesMap = {};

      cSnap.docs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        cMap[doc.id] = data.name || 'Unknown';
      });

      setCharities(cMap);
      toast.success('Donations loaded successfully ');
    } catch (error) {
      console.error(error);
      toast.error('Failed to load donations ');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const totalAmount: number = donations.reduce(
    (sum, donation) => sum + (donation.amount || 0),
    0,
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-100">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-4 md:p-6">
        {/* Header with Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Donations</h2>
            <p className="text-gray-600 mt-1">
              Total Donations: ₹{totalAmount.toLocaleString('en-IN')}
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={fetching}
            className="inline-flex items-center gap-2 bg-linear-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            {fetching ? (
              <>
                <Loader size="sm" />
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>

        {/* Donations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 px-3 md:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="py-3.5 px-3 md:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="py-3.5 px-3 md:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Charity
                  </th>
                  <th className="py-3.5 px-3 md:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {donations.map((d: Donation) => (
                  <tr
                    key={d.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-3 px-3 md:px-4">
                      <div className="max-w-50 md:max-w-none">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {d.userEmail || 'N/A'}
                        </p>
                        {d.userId && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            ID: {d.userId.slice(0, 8)}...
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 md:px-4">
                      <span className="text-sm font-semibold text-green-600 whitespace-nowrap">
                        ₹ {d.amount?.toLocaleString('en-IN') || 0}
                      </span>
                    </td>
                    <td className="py-3 px-3 md:px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                        {charities[d.charityId] || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3 px-3 md:px-4">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(d.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {donations.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-2 text-gray-500 text-lg">
                No donations available
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Be the first to make a donation!
              </p>
            </div>
          )}

          {/* Donations Count */}
          {donations.length > 0 && (
            <div className="border-t border-gray-200 px-3 md:px-4 py-3 bg-gray-50">
              <p className="text-xs text-gray-500">
                Showing <span className="font-medium">{donations.length}</span>{' '}
                donation
                {donations.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Refresh Indicator */}
        {fetching && donations.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 border border-gray-200">
            <Loader size="sm" />
            <span className="text-sm text-gray-600">Updating donations...</span>
          </div>
        )}
      </div>
    </div>
  );
}
