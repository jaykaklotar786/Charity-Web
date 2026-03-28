/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  DollarSign,
  Heart,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

// Define types
interface Donation {
  id: string;
  amount: number;
  charityId: string;
  charityName?: string;
  userId?: string;
  userEmail?: string;
  createdAt?: Date | null;
  paymentId?: string;
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

export default function MyDonationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [charities, setCharities] = useState<CharitiesMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [fetching, setFetching] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser: User | null) => {
        if (!currentUser) {
          toast.error('Please sign in to view your donations');
          router.push('/signin');
          return;
        }
        setUser(currentUser);
        setAuthChecking(false);
      },
    );

    return () => unsubscribe();
  }, [router]);

  // Fetch user's donations
  const fetchUserDonations = async (): Promise<void> => {
    if (!user) return;

    try {
      setFetching(true);
      setLoading(true);

      // Try with orderBy first, fallback to client-side sorting
      let dList: Donation[] = [];

      try {
        // Attempt to use orderBy (requires index)
        const donationsQuery = query(
          collection(db, 'donations'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
        );

        const dSnap = await getDocs(donationsQuery);

        dList = dSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          return {
            id: doc.id,
            amount: data.amount || 0,
            charityId: data.charityId || '',
            userId: data.userId,
            userEmail: data.userEmail,
            createdAt: data.createdAt?.toDate?.() || null,
            paymentId: data.paymentId,
            status: data.status || 'success',
          };
        });
      } catch (indexError: any) {
        // If index error, query without orderBy and sort client-side
        console.log('Index not ready, using client-side sorting');

        const donationsQuery = query(
          collection(db, 'donations'),
          where('userId', '==', user.uid),
        );

        const dSnap = await getDocs(donationsQuery);

        dList = dSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          return {
            id: doc.id,
            amount: data.amount || 0,
            charityId: data.charityId || '',
            userId: data.userId,
            userEmail: data.userEmail,
            createdAt: data.createdAt?.toDate?.() || null,
            paymentId: data.paymentId,
            status: data.status || 'success',
          };
        });

        // Sort manually by date (newest first)
        dList = dList.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }

      setDonations(dList);

      // Fetch charity names for the donations
      if (dList.length > 0) {
        const charityIds = [...new Set(dList.map((d) => d.charityId))];
        const cMap: CharitiesMap = {};

        for (const charityId of charityIds) {
          const charityDoc = await getDocs(
            query(
              collection(db, 'charities'),
              where('__name__', '==', charityId),
            ),
          );
          if (!charityDoc.empty) {
            cMap[charityId] = charityDoc.docs[0].data().name || 'Unknown';
          } else {
            cMap[charityId] = 'Unknown';
          }
        }

        setCharities(cMap);
      }

      if (dList.length === 0) {
        toast.info('No donations found');
      } else {
        toast.success('Donations loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to load your donations. Please try again later.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserDonations();
    }
  }, [user]);

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

  const donationCount = donations.length;
  const averageDonation = donationCount > 0 ? totalAmount / donationCount : 0;

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header with Back Button */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Donations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your donation history and impact
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Donated</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Donations</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {donationCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Donation</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  ₹{Math.round(averageDonation).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mb-6">
          <button
            onClick={fetchUserDonations}
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
                <span>Refresh Donations</span>
              </>
            )}
          </button>
        </div>

        {/* Donations List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader size="lg" />
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-12 md:py-16">
              <Heart className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-3 text-gray-500 text-lg">No donations yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Make your first donation to start making a difference!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-2.5 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Heart className="w-4 h-4" />
                <span>Make a Donation</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Charity
                      </th>
                      <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {donations.map((donation: Donation) => (
                      <tr
                        key={donation.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-green-600">
                            ₹ {donation.amount?.toLocaleString('en-IN') || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {charities[donation.charityId] || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(donation.createdAt)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-gray-500 font-mono">
                            {donation.paymentId
                              ? donation.paymentId.slice(0, 12) + '...'
                              : 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Success
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {donations.map((donation: Donation) => (
                  <div
                    key={donation.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-lg font-bold text-green-600">
                        ₹ {donation.amount?.toLocaleString('en-IN') || 0}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Success
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="text-sm text-gray-700">
                          {charities[donation.charityId] || 'Unknown'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-500">
                          {formatDate(donation.createdAt)}
                        </span>
                      </div>

                      {donation.paymentId && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-mono">
                            ID: {donation.paymentId.slice(0, 12)}...
                          </span>
                        </div>
                      )}
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

        {/* Make a Donation CTA */}
        {donations.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Heart className="w-5 h-5" />
              <span>Make Another Donation</span>
            </Link>
          </div>
        )}

        {/* Refresh Indicator */}
        {fetching && donations.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 border border-gray-200 z-50">
            <Loader size="sm" />
            <span className="text-sm text-gray-600">
              Updating your donations...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
