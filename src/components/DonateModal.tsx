'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

export default function DonateModal({ onClose }) {
  const [charities, setCharities] = useState([]);
  const [amount, setAmount] = useState('');
  const [selectedCharity, setSelectedCharity] = useState('');

  //  Load charities
  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const snap = await getDocs(collection(db, 'charities'));
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCharities(list);
      } catch (error) {
        console.error('Error fetching charities:', error);
      }
    };

    fetchCharities();
  }, []);

  //  Submit donation
  const handleDonate = async () => {
    if (!amount || !selectedCharity) {
      alert('Fill all fields');
      return;
    }

    try {
      const user = auth.currentUser;

      await addDoc(collection(db, 'donations'), {
        amount: Number(amount),
        charityId: selectedCharity,
        userId: user?.uid || null,
        userEmail: user?.email || null,
        createdAt: serverTimestamp(),
      });

      alert('Donation Added');
      onClose();
    } catch (error) {
      console.error('Error adding donation:', error);
      alert('Failed to add donation. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[999]">
      <div className="relative z-50">
        <div className="bg-white p-6 rounded-xl w-96 relative z-[1000]">
          <h2 className="text-xl font-bold mb-4">Donate</h2>

          <input
            type="number"
            placeholder="Enter amount"
            className="border p-2 w-full mb-3 rounded"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            className="border p-2 w-full mb-4 rounded"
            value={selectedCharity}
            onChange={(e) => setSelectedCharity(e.target.value)}
          >
            <option value="">Select Charity</option>
            {charities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button onClick={onClose} className="w-full border py-2 rounded">
              Cancel
            </button>

            <button
              onClick={handleDonate}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Donate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
