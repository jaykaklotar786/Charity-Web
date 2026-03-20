'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function CharityPage() {
  const [charityName, setCharityName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCharity = async () => {
    if (!charityName) {
      alert('Enter charity name');
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, 'charities'), {
        name: charityName,
        createdAt: new Date(),
      });

      alert('Charity added!');
      setCharityName('');
    } catch (err) {
      console.error(err);
      alert('Error adding charity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md bg-white p-6 rounded-xl shadow justify-center items-center mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Charity</h2>

      <input
        type="text"
        placeholder="Enter charity name"
        className="border p-2 w-full mb-4 rounded"
        value={charityName}
        onChange={(e) => setCharityName(e.target.value)}
      />

      <button
        onClick={handleAddCharity}
        disabled={loading}
        className="bg-[#7CB518] text-white px-4 py-2 rounded w-full"
      >
        {loading ? 'Adding...' : 'Add Charity'}
      </button>
    </div>
  );
}
