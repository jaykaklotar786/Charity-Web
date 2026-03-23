'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function DonationsPage() {
  const [donations, setDonations] = useState([]);
  const [charities, setCharities] = useState({});

  const fetchData = async () => {
    // donations
    const dSnap = await getDocs(collection(db, 'donations'));
    const dList = dSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDonations(dList);

    // charities map
    const cSnap = await getDocs(collection(db, 'charities'));
    const cMap = {};
    cSnap.docs.forEach((doc) => {
      cMap[doc.id] = doc.data().name;
    });

    setCharities(cMap);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Donations</h2>

      <div className="bg-white p-4 rounded shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th>User</th>
              <th>Amount</th>
              <th>Charity</th>
            </tr>
          </thead>

          <tbody>
            {donations.map((d) => (
              <tr key={d.id} className="border-b">
                <td>{d.userEmail}</td>
                <td>₹ {d.amount}</td>
                <td>{charities[d.charityId]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
