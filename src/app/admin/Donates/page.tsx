'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { toast } from 'sonner';

// Loader Component
const Loader = ({ size = 'md' }) => {
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

// Skeleton Loader for Table
const TableSkeleton = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export default function DonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [charities, setCharities] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const fetchData = async () => {
    try {
      setFetching(true);
      setLoading(true);

      // ✅ Donations fetch with ordering
      const donationsQuery = query(
        collection(db, 'donations'),
        orderBy('createdAt', 'desc'),
      );

      const dSnap = await getDocs(donationsQuery);

      if (dSnap.empty) {
        toast.info('No donations found');
      }

      const dList = dSnap.docs.map((doc) => {
        const data = doc.data();

        // 🔍 Basic validation
        if (!data.userEmail || !data.amount || !data.charityId) {
          console.warn('Invalid donation data:', data);
        }

        return {
          id: doc.id,
          ...data,
          // Format date if exists
          createdAt: data.createdAt?.toDate?.() || null,
        };
      });

      setDonations(dList);

      // ✅ Charities fetch
      const cSnap = await getDocs(collection(db, 'charities'));
      const cMap: any = {};

      cSnap.docs.forEach((doc) => {
        const data = doc.data();

        if (!data.name) {
          console.warn('Invalid charity:', data);
        }

        cMap[doc.id] = data.name || 'Unknown';
      });

      setCharities(cMap);

      toast.success('Donations loaded successfully ✅');
    } catch (error) {
      console.error(error);
      toast.error('Failed to load donations ❌');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format date for display
  const formatDate = (date: any) => {
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

  // Calculate total donations
  const totalAmount = donations.reduce(
    (sum, donation) => sum + (donation.amount || 0),
    0,
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Donations</h2>
          <p className="text-gray-600 mt-1">
            Total Donations: ₹{totalAmount.toLocaleString('en-IN')}
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={fetching}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {fetching ? (
            <>
              <Loader size="sm" />
              <span>Refreshing...</span>
            </>
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {fetching && donations.length === 0 ? (
          <div className="p-8">
            <TableSkeleton />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b text-left">
                    <th className="py-3 px-4 font-semibold text-gray-700">
                      User
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-700">
                      Charity
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-700">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {donations.map((d: any) => (
                    <tr
                      key={d.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{d.userEmail || 'N/A'}</p>
                          {d.userId && (
                            <p className="text-xs text-gray-500">
                              ID: {d.userId.slice(0, 8)}...
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-green-600">
                          ₹ {d.amount?.toLocaleString('en-IN') || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {charities[d.charityId] || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {formatDate(d.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {donations.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <svg
                    className="w-16 h-16 mx-auto"
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
                </div>
                <p className="text-gray-500 text-lg">No donations available</p>
                <p className="text-gray-400 text-sm mt-1">
                  Be the first to make a donation!
                </p>
              </div>
            )}

            {/* Donations Count */}
            {donations.length > 0 && (
              <div className="border-t px-4 py-3 bg-gray-50 text-sm text-gray-600">
                Showing {donations.length} donation
                {donations.length !== 1 ? 's' : ''}
              </div>
            )}
          </>
        )}
      </div>

      {/* Refresh Indicator for existing data */}
      {fetching && donations.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <Loader size="sm" />
          <span className="text-sm text-gray-600">Updating donations...</span>
        </div>
      )}
    </div>
  );
}
