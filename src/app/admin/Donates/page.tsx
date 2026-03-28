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
import {
  RefreshCw,
  DollarSign,
  Users,
  Calendar,
  Mail,
  Phone,
} from 'lucide-react';

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

  // Calculate stats
  const uniqueDonors = new Set(donations.map((d) => d.userEmail)).size;
  const averageDonation =
    donations.length > 0 ? totalAmount / donations.length : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Donations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage all donation transactions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Donations Count</p>
                <p className="text-2xl font-bold text-gray-900">
                  {donations.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unique Donors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {uniqueDonors}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mb-6">
          <button
            onClick={fetchData}
            disabled={fetching}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {fetching ? (
              <>
                <Loader size="sm" />
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Data</span>
              </>
            )}
          </button>
        </div>

        {/* Donations Table/Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {donations.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500 text-lg">
                No donations available
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Be the first to make a donation!
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        User
                      </th>
                      <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Charity
                      </th>
                      <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {d.userEmail || 'N/A'}
                            </p>
                            {d.userId && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                ID: {d.userId.slice(0, 8)}...
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-green-600 whitespace-nowrap">
                            ₹ {d.amount?.toLocaleString('en-IN') || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {charities[d.charityId] || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(d.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Visible on mobile */}
              <div className="md:hidden divide-y divide-gray-200">
                {donations.map((d: Donation) => (
                  <div
                    key={d.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="break-all">
                            {d.userEmail || 'N/A'}
                          </span>
                        </p>
                        {d.userId && (
                          <p className="text-xs text-gray-500 mt-1">
                            ID: {d.userId.slice(0, 8)}...
                          </p>
                        )}
                      </div>
                      <span className="text-base font-bold text-green-600 shrink-0 ml-2">
                        ₹ {d.amount?.toLocaleString('en-IN') || 0}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {charities[d.charityId] || 'Unknown'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(d.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Donations Count */}
              <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                <p className="text-xs text-gray-500">
                  Showing{' '}
                  <span className="font-medium">{donations.length}</span>{' '}
                  donation{donations.length !== 1 ? 's' : ''}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Refresh Indicator */}
        {fetching && donations.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 border border-gray-200 z-50">
            <Loader size="sm" />
            <span className="text-sm text-gray-600">Updating donations...</span>
          </div>
        )}
      </div>
    </div>
  );
}
