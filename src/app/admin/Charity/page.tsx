'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { toast } from 'sonner';
import Loader from '@/components/Loader';
import { Plus, Heart, Calendar } from 'lucide-react';

interface Charity {
  id: string;
  name: string;
  createdAt?: Timestamp;
}

export default function CharityPage() {
  const [name, setName] = useState<string>('');
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [adding, setAdding] = useState<boolean>(false);

  const fetchCharities = async (): Promise<void> => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  const handleAdd = async (): Promise<void> => {
    if (!name.trim()) {
      toast.error('Please enter a charity name');
      return;
    }

    setAdding(true);
    try {
      await addDoc(collection(db, 'charities'), {
        name: name.trim(),
        createdAt: serverTimestamp(),
      });

      toast.success('Charity added successfully! 🎉');
      setName('');
      await fetchCharities();
    } catch (error) {
      console.error('Error adding charity:', error);
      toast.error('Failed to add charity. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !adding) {
      handleAdd();
    }
  };

  // Calculate stats
  const totalCharities = charities.length;
  const activeCharities = charities.length; // All charities are active

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Charity Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Add and manage charitable organizations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Charities</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalCharities}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Charities</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeCharities}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Charity Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add New Charity
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                onKeyPress={handleKeyPress}
                placeholder="Enter charity name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                disabled={adding}
                autoFocus
              />
            </div>

            <button
              onClick={handleAdd}
              disabled={adding || !name.trim()}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-2.5 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? (
                <>
                  <Loader size="sm" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Add Charity</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Press Enter to quickly add a charity
          </p>
        </div>

        {/* Charities List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                Charities List
              </h3>
              <span className="text-sm text-gray-500 bg-gray-200 px-2.5 py-0.5 rounded-full">
                {charities.length}{' '}
                {charities.length === 1 ? 'charity' : 'charities'}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader size="lg" />
            </div>
          ) : charities.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">No charities found</p>
              <p className="text-sm text-gray-400 mt-1">
                Add your first charity above
              </p>
            </div>
          ) : (
            <>
              {/* Desktop View - Hidden on mobile */}
              <div className="hidden md:block">
                <div className="divide-y divide-gray-200">
                  {charities.map((c: Charity) => (
                    <div
                      key={c.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150 flex items-center gap-3"
                    >
                      <div className="shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-semibold">
                          {(c.name?.charAt(0) || '?').toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{c.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          Added{' '}
                          {c.createdAt?.toDate?.()?.toLocaleDateString() ||
                            'recently'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Card View - Visible on mobile */}
              <div className="md:hidden divide-y divide-gray-200">
                {charities.map((c: Charity) => (
                  <div
                    key={c.id}
                    className="p-4 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                          {(c.name?.charAt(0) || '?').toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-semibold text-gray-900 break-words flex-1">
                            {c.name}
                          </h4>
                          <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            Added{' '}
                            {c.createdAt?.toDate?.()?.toLocaleDateString() ||
                              'recently'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Count */}
              <div className="border-t border-gray-200 px-4 md:px-6 py-3 bg-gray-50">
                <p className="text-xs text-gray-500">
                  Showing{' '}
                  <span className="font-medium">{charities.length}</span>{' '}
                  {charities.length === 1 ? 'charity' : 'charities'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
