'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

export default function CharityPage() {
  const [name, setName] = useState('');
  const [charities, setCharities] = useState([]);

  //  Fetch charities
  const fetchCharities = async () => {
    const snap = await getDocs(collection(db, 'charities'));
    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCharities(list);
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  //  Add charity
  const handleAdd = async () => {
    if (!name) return alert('Enter charity name');

    await addDoc(collection(db, 'charities'), {
      name,
      createdAt: serverTimestamp(),
    });

    setName('');
    fetchCharities();
  };

  return (
    <div>
      <h2 className="text-2xl mb-4 font-bold">Add Charity</h2>

      <div className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Charity name"
          className="border p-2 rounded w-64"
        />

        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-2 font-semibold">Charities List</h3>

        {charities.map((c) => (
          <div key={c.id} className="border-b py-2">
            {c.name}
          </div>
        ))}
      </div>
    </div>
  );
}
