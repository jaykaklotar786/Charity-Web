'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { toast } from 'sonner';
import Loader from '@/components/Loader';

export default function CharityPage() {
  const [name, setName] = useState('');
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  // Fetch charities
  const fetchCharities = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  // Add charity
  const handleAdd = async () => {
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

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !adding) {
      handleAdd();
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Charity Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Add and manage charitable organizations
          </p>
        </div>

        {/* Add Charity Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add New Charity
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-2.5 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
            >
              {adding ? (
                <>
                  <Loader size="sm" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
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
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
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
                  d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 21v-4H7v4"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 7v6m-3-3h6"
                />
              </svg>
              <p className="mt-2 text-gray-500">No charities found</p>
              <p className="text-sm text-gray-400 mt-1">
                Add your first charity above
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {charities.map((c, index) => (
                <div
                  key={c.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150 flex items-center gap-3"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-semibold">
                      {(c.name?.charAt(0) || '?').toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">
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
          )}

          {/* Footer with count */}
          {!loading && charities.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
              <p className="text-xs text-gray-500">
                Showing <span className="font-medium">{charities.length}</span>{' '}
                {charities.length === 1 ? 'charity' : 'charities'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
