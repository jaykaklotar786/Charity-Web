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
import { sendSignInLinkToEmail } from 'firebase/auth';
import { toast } from 'sonner';

// ✅ Formik
import { useFormik } from 'formik';
import * as Yup from 'yup';

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [showInvite, setShowInvite] = useState(false);

  const [editUser, setEditUser] = useState<any>(null);
  const [editData, setEditData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    mobile: '',
  });

  // 🔐 ADMIN CHECK
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push('/');

      const admin = await isAdmin(user.uid);
      if (!admin) return router.push('/');

      setLoading(false);
    });

    return () => unsub();
  }, []);

  // 👥 FETCH USERS
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

  // ❌ DELETE USER
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'users', id));
    toast.success('User deleted');
    fetchUsers();
  };

  // 🔁 ENABLE / DISABLE
  const toggleDisable = async (user: any) => {
    await updateDoc(doc(db, 'users', user.id), {
      disabled: !user.disabled,
    });
    toast.success('User updated');
    fetchUsers();
  };

  // ✏️ UPDATE USER
  const handleUpdate = async () => {
    await updateDoc(doc(db, 'users', editUser.id), {
      firstname: editData.firstname,
      lastname: editData.lastname,
      mobile: editData.mobile,
    });

    toast.success('User updated successfully');
    setEditUser(null);
    fetchUsers();
  };

  // ✅ FORMik (Invite)
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const actionCodeSettings = {
          url: 'http://localhost:3000/complete-signup',
          handleCodeInApp: true,
        };

        const trimmedEmail = values.email.trim();

        await sendSignInLinkToEmail(auth, trimmedEmail, actionCodeSettings);

        localStorage.setItem('emailForSignIn', trimmedEmail);

        toast.success('Invite sent successfully 🎉');

        resetForm();
        setShowInvite(false);
      } catch (error: any) {
        console.log(error);

        if (error.code === 'auth/invalid-email') {
          toast.error('Invalid email');
        } else if (error.code === 'auth/missing-email') {
          toast.error('Email is required');
        } else if (error.code === 'auth/quota-exceeded') {
          toast.error('Quota exceeded');
        } else {
          toast.error('Failed to send invite');
        }
      }
    },
  });

  const editFormik = useFormik({
    enableReinitialize: true, // 🔥 IMPORTANT (editUser change pe data update hoga)

    initialValues: {
      firstname: editData.firstname || '',
      lastname: editData.lastname || '',
      email: editData.email || '',
      mobile: editData.mobile || '',
    },

    validationSchema: Yup.object({
      firstname: Yup.string().required('First name is required'),
      lastname: Yup.string().required('Last name is required'),
      mobile: Yup.string()
        .matches(/^[0-9]{10}$/, 'Mobile must be 10 digits')
        .required('Mobile is required'),
    }),

    onSubmit: async (values) => {
      try {
        await updateDoc(doc(db, 'users', editUser.id), {
          firstname: values.firstname,
          lastname: values.lastname,
          mobile: values.mobile,
        });

        toast.success('User updated successfully');
        setEditUser(null);
        fetchUsers();
      } catch (error) {
        console.log(error);
        toast.error('Update failed');
      }
    },
  });

  if (loading) return <p className="p-10">Checking admin...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
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
                {users.map((user: any) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-2">
                      {user.firstname} {user.lastname}
                    </td>

                    <td>{user.email}</td>

                    <td className="flex gap-2 py-2">
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

                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>

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

        {showInvite && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded w-96">
              <h2 className="text-xl mb-4">Invite User</h2>

              <form onSubmit={formik.handleSubmit}>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  className="border p-2 w-full mb-2"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />

                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-sm mb-2">
                    {formik.errors.email}
                  </p>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowInvite(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    className="bg-[#7CB518] text-white px-4 py-2 rounded"
                  >
                    Send Invite
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ✏️ EDIT MODAL */}
        {editUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-center">Edit User</h2>

              <form onSubmit={editFormik.handleSubmit}>
                <input
                  type="text"
                  name="firstname"
                  placeholder="First Name"
                  className="border p-2 w-full mb-2 rounded"
                  value={editFormik.values.firstname}
                  onChange={editFormik.handleChange}
                  onBlur={editFormik.handleBlur}
                />

                {editFormik.touched.firstname &&
                  editFormik.errors.firstname && (
                    <p className="text-red-500 text-sm mb-2">
                      {editFormik.errors.firstname}
                    </p>
                  )}

                <input
                  type="text"
                  name="lastname"
                  placeholder="Last Name"
                  className="border p-2 w-full mb-2 rounded"
                  value={editFormik.values.lastname}
                  onChange={editFormik.handleChange}
                  onBlur={editFormik.handleBlur}
                />

                {editFormik.touched.lastname && editFormik.errors.lastname && (
                  <p className="text-red-500 text-sm mb-2">
                    {editFormik.errors.lastname}
                  </p>
                )}

                <input
                  type="email"
                  className="border p-2 w-full mb-3 rounded bg-gray-100"
                  value={editFormik.values.email}
                  disabled
                />

                <input
                  type="text"
                  name="mobile"
                  placeholder="Mobile"
                  className="border p-2 w-full mb-2 rounded"
                  value={editFormik.values.mobile}
                  onChange={editFormik.handleChange}
                  onBlur={editFormik.handleBlur}
                />

                {editFormik.touched.mobile && editFormik.errors.mobile && (
                  <p className="text-red-500 text-sm mb-2">
                    {editFormik.errors.mobile}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditUser(null)}
                    className="w-full border py-2 rounded"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="w-full bg-[#7CB518] text-white py-2 rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
