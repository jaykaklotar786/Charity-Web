// app/admin/page.js (Updated with improved button styling)
'use client';

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
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Loader Component
const Loader = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 border-t-green-600`}
      ></div>
    </div>
  );
};

// Action Button Component
const ActionButton = ({
  onClick,
  disabled,
  loading,
  children,
  variant = 'primary',
  className = '',
}) => {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
    danger: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
    warning: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
    success: 'bg-green-500 hover:bg-green-600 focus:ring-green-500',
    outline:
      'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {loading && <Loader size="sm" />}
      {children}
    </button>
  );
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);

  // Admin check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push('/');
      const admin = await isAdmin(user.uid);
      if (!admin) return router.push('/');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Fetch users
  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(list);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  const handleDelete = async (id: string) => {
    setDeletingUser(id);
    try {
      await deleteDoc(doc(db, 'users', id));
      toast.success('User deleted successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeletingUser(null);
    }
  };

  // Toggle disable
  const toggleDisable = async (user: any) => {
    setUpdatingUser(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        disabled: !user.disabled,
      });
      toast.success(
        `User ${!user.disabled ? 'disabled' : 'enabled'} successfully`,
      );
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setUpdatingUser(false);
    }
  };

  // Invite form
  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setSendingInvite(true);
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
        } else {
          toast.error('Failed to send invite');
        }
      } finally {
        setSendingInvite(false);
      }
    },
  });

  // Edit form
  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstname: editUser?.firstname || '',
      lastname: editUser?.lastname || '',
      email: editUser?.email || '',
      mobile: editUser?.mobile || '',
    },
    validationSchema: Yup.object({
      firstname: Yup.string().required('First name is required'),
      lastname: Yup.string().required('Last name is required'),
      mobile: Yup.string()
        .matches(/^[0-9]{10}$/, 'Mobile must be 10 digits')
        .required('Mobile is required'),
    }),
    onSubmit: async (values) => {
      setUpdatingUser(true);
      try {
        await updateDoc(doc(db, 'users', editUser.id), {
          firstname: values.firstname,
          lastname: values.lastname,
          mobile: values.mobile,
        });
        toast.success('User updated successfully');
        setEditUser(null);
        await fetchUsers();
      } catch (error) {
        console.log(error);
        toast.error('Update failed');
      } finally {
        setUpdatingUser(false);
      }
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-4 md:p-6">
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Users</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage user accounts and permissions
            </p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-5 py-2.5 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
          >
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
            Invite User
          </button>
        </div>

        {/* USERS TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {fetchingUsers ? (
            <div className="p-8 flex justify-center">
              <Loader size="md" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.map((user: any) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {user.firstname?.[0]}
                              {user.lastname?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {user.firstname} {user.lastname}
                              </p>
                              {user.mobile && (
                                <p className="text-xs text-gray-500">
                                  {user.mobile}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${
                              user.disabled
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }
                          `}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.disabled ? 'bg-red-500' : 'bg-green-500'}`}
                            ></span>
                            {user.disabled ? 'Disabled' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <ActionButton
                              onClick={() => setEditUser(user)}
                              variant="primary"
                              disabled={updatingUser}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </ActionButton>

                            <ActionButton
                              onClick={() => handleDelete(user.id)}
                              variant="danger"
                              loading={deletingUser === user.id}
                              disabled={deletingUser === user.id}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              {deletingUser === user.id
                                ? 'Deleting...'
                                : 'Delete'}
                            </ActionButton>

                            <ActionButton
                              onClick={() => toggleDisable(user)}
                              variant={user.disabled ? 'success' : 'warning'}
                              disabled={updatingUser}
                            >
                              {user.disabled ? (
                                <>
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  Enable
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                    />
                                  </svg>
                                  Disable
                                </>
                              )}
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {users.length === 0 && (
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <p className="mt-2 text-gray-500">No users found</p>
                </div>
              )}

              {/* Users Count */}
              {users.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                  <p className="text-xs text-gray-500">
                    Showing <span className="font-medium">{users.length}</span>{' '}
                    user{users.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Invite Modal */}
        {showInvite && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl transform transition-all">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Invite User</h2>
                <button
                  onClick={() => setShowInvite(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={formik.handleSubmit}>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={sendingInvite}
                  autoFocus
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-red-500 text-sm">
                    {formik.errors.email}
                  </p>
                )}
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowInvite(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={sendingInvite}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={sendingInvite}
                  >
                    {sendingInvite && <Loader size="sm" />}
                    {sendingInvite ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl transform transition-all">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
                <button
                  onClick={() => setEditUser(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={editFormik.handleSubmit}>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="firstname"
                    placeholder="First Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={editFormik.values.firstname}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    disabled={updatingUser}
                  />
                  {editFormik.touched.firstname &&
                    editFormik.errors.firstname && (
                      <p className="text-red-500 text-sm -mt-2">
                        {editFormik.errors.firstname}
                      </p>
                    )}

                  <input
                    type="text"
                    name="lastname"
                    placeholder="Last Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={editFormik.values.lastname}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    disabled={updatingUser}
                  />
                  {editFormik.touched.lastname &&
                    editFormik.errors.lastname && (
                      <p className="text-red-500 text-sm -mt-2">
                        {editFormik.errors.lastname}
                      </p>
                    )}

                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    value={editFormik.values.email}
                    disabled
                  />

                  <input
                    type="text"
                    name="mobile"
                    placeholder="Mobile Number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={editFormik.values.mobile}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    disabled={updatingUser}
                  />
                  {editFormik.touched.mobile && editFormik.errors.mobile && (
                    <p className="text-red-500 text-sm -mt-2">
                      {editFormik.errors.mobile}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditUser(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={updatingUser}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={updatingUser}
                  >
                    {updatingUser && <Loader size="sm" />}
                    {updatingUser ? 'Saving...' : 'Save Changes'}
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
