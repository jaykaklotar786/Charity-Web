'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';

export default function DonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [charities, setCharities] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      // ✅ Donations fetch
      const dSnap = await getDocs(collection(db, 'donations'));

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
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p className="p-6">Loading donations...</p>;

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
            {donations.map((d: any) => (
              <tr key={d.id} className="border-b">
                <td>{d.userEmail || 'N/A'}</td>
                <td>₹ {d.amount || 0}</td>
                <td>{charities[d.charityId] || 'Unknown'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {donations.length === 0 && (
          <p className="text-center py-4 text-gray-500">
            No donations available
          </p>
        )}
      </div>
    </div>
  );
}
