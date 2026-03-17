'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { isAdmin } from '@/lib/adminCheck';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    }

    fetchUsers();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      }

      const admin = await isAdmin(user.uid);

      if (!admin) {
        router.push('/');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* LEFT SIDEBAR */}
      <div className="w-70 bg-[#1e293b] text-white flex flex-col">
        <div className="p-5 text-xl font-semibold border-b border-gray-700">
          Users
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`p-3 rounded-lg cursor-pointer transition 
              ${
                selectedUser?.id === user.id
                  ? 'bg-[#334155]'
                  : 'hover:bg-[#334155]'
              }`}
            >
              <p className="text-sm font-medium">
                {user.firstname} {user.lastname}
              </p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 p-8">
        {selectedUser ? (
          <div className="bg-white rounded-2xl shadow-md p-6 max-w-xl">
            <h2 className="text-2xl font-bold mb-4">
              {selectedUser.firstname} {selectedUser.lastname}
            </h2>

            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-semibold">Email:</span>{' '}
                {selectedUser.email}
              </p>
              <p>
                <span className="font-semibold">Mobile:</span>{' '}
                {selectedUser.mobile}
              </p>
              <p>
                <span className="font-semibold">Role:</span>{' '}
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-md">
                  {selectedUser.role}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-lg">
            Select a user from the left panel 👈
          </div>
        )}
      </div>
      <button
        onClick={() => router.push('/admin/invite')}
        className="bg-green-500 text-white px-4 py-2 w-1.50 absolute top-5 right-5 rounded-lg"
      >
        Invite User
      </button>
    </div>
  );
}
