'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { isAdmin } from '@/lib/adminCheck';
import { useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState('');

  const [editUser, setEditUser] = useState(null);
  const [editData, setEditData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    mobile: '',
  });

  // ADMIN CHECK
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push('/');

      const admin = await isAdmin(user.uid);
      if (!admin) return router.push('/');

      setLoading(false);
    });

    return () => unsub();
  }, []);

  // 📥 FETCH USERS
  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(list);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  //  DELETE USER
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'users', id));
    fetchUsers();
  };

  //  ENABLE / DISABLE
  const toggleDisable = async (user) => {
    await updateDoc(doc(db, 'users', user.id), {
      disabled: !user.disabled,
    });
    fetchUsers();
  };

  //  UPDATE USER
  const handleUpdate = async () => {
    await updateDoc(doc(db, 'users', editUser.id), {
      firstname: editData.firstname,
      lastname: editData.lastname,
      mobile: editData.mobile,
    });

    setEditUser(null);
    fetchUsers();
  };

  if (loading) return <p className="p-10">Checking admin...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-64 bg-[#2C3A04] text-white p-6 flex flex-col">
        <Link href="/" className="mb-10">
          <Image
            src="/Images/site-logo-white-2.svg"
            alt="Charity Logo"
            width={150}
            height={38}
          />
        </Link>

        <button
          onClick={() => setActiveTab('users')}
          className={`p-2 rounded text-left transition ${
            activeTab === 'users' ? 'bg-[#7CB518]' : 'hover:bg-[#3d4a22]'
          }`}
        >
          Users
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 p-6">
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Users</h2>

          <button
            onClick={() => setShowInvite(true)}
            className="bg-[#7CB518] text-white px-4 py-2 rounded"
          >
            Invite User
          </button>
        </div>

        {/* USERS TABLE */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow p-4">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-2">
                      {user.firstname} {user.lastname}
                    </td>

                    <td>{user.email}</td>

                    <td className="flex gap-2 py-2">
                      {/* EDIT */}
                      <button
                        onClick={() => {
                          setEditUser(user);
                          setEditData({
                            firstname: user.firstname || '',
                            lastname: user.lastname || '',
                            email: user.email || '',
                            mobile: user.mobile || '',
                          });
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>

                      {/* ENABLE/DISABLE */}
                      <button
                        onClick={() => toggleDisable(user)}
                        className={`px-3 py-1 rounded text-white ${
                          user.disabled ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                      >
                        {user.disabled ? 'Enable' : 'Disable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* INVITE MODAL */}
        {showInvite && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded w-96">
              <h2 className="text-xl mb-4">Invite User</h2>

              <input
                type="email"
                placeholder="Enter email"
                className="border p-2 w-full mb-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="flex justify-between">
                <button
                  onClick={() => setShowInvite(false)}
                  className="px-4 py-2 border rounded"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    alert('Invite logic here');
                    setShowInvite(false);
                  }}
                  className="bg-[#7CB518] text-white px-4 py-2 rounded"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-center">Edit User</h2>

              <input
                type="text"
                placeholder="First Name"
                className="border p-2 w-full mb-3 rounded"
                value={editData.firstname}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    firstname: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Last Name"
                className="border p-2 w-full mb-3 rounded"
                value={editData.lastname}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    lastname: e.target.value,
                  })
                }
              />

              <input
                type="email"
                className="border p-2 w-full mb-3 rounded bg-gray-100"
                value={editData.email}
                disabled
              />

              <input
                type="text"
                placeholder="Mobile"
                className="border p-2 w-full mb-4 rounded"
                value={editData.mobile}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    mobile: e.target.value,
                  })
                }
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setEditUser(null)}
                  className="w-full border py-2 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdate}
                  className="w-full bg-[#7CB518] text-white py-2 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
