'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { isAdmin } from '@/lib/adminCheck';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      }

      const admin = await isAdmin(user.uid);

      if (!admin) {
        router.push('/');
        return;
      }

      // ADMIN OK → fetch users
      const querySnapshot = await getDocs(collection(db, 'users'));

      const userList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(userList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <p>Checking admin...</p>;

  return (
    <div className="flex h-screen">
      {/* LEFT SIDE USERS */}
      <div className="w-1/3 border-r overflow-y-scroll p-4">
        <h2 className="text-xl font-bold mb-4">Users</h2>

        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className="p-3 border mb-2 cursor-pointer hover:bg-gray-100"
          >
            {user.firstname} {user.lastname}
          </div>
        ))}
      </div>

      {/* RIGHT SIDE DETAILS */}
      <div className="flex-1 p-6">
        {selectedUser ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {selectedUser.firstname} {selectedUser.lastname}
            </h2>

            <p>Email: {selectedUser.email}</p>
            <p>Mobile: {selectedUser.mobile}</p>
            <p>Role: {selectedUser.role}</p>
          </div>
        ) : (
          <p>Select a user</p>
        )}
      </div>
    </div>
  );
}
