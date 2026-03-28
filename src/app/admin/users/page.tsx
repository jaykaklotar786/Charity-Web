'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  User,
  sendSignInLinkToEmail,
  AuthError,
} from 'firebase/auth';
import { isAdmin } from '@/lib/adminCheck';
import { useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Edit2,
  Trash2,
  Power,
  Plus,
  X,
  Users,
  Mail,
  Phone,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Define User type
interface UserData {
  id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  mobile?: string;
  disabled?: boolean;
  createdAt?: Timestamp;
}

// Define Edit User Data type
interface EditUserData {
  firstname: string;
  lastname: string;
  email: string;
  mobile: string;
}

// Loader Component Props
interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
}

// Loader Component
const Loader = ({ size = 'sm' }: LoaderProps) => {
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

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [showInvite, setShowInvite] = useState<boolean>(false);
  const [fetchingUsers, setFetchingUsers] = useState<boolean>(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<boolean>(false);
  const [sendingInvite, setSendingInvite] = useState<boolean>(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);

  // Admin check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) return router.push('/');
      const admin = await isAdmin(user.uid);
      if (!admin) return router.push('/');
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  // Fetch users
  const fetchUsers = async (): Promise<void> => {
    setFetchingUsers(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: UserData[] = snap.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data(),
        }),
      ) as UserData[];
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
  const handleDelete = async (id: string): Promise<void> => {
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
  const toggleDisable = async (user: UserData): Promise<void> => {
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
      } catch (error: unknown) {
        console.log(error);
        const authError = error as AuthError;
        if (authError.code === 'auth/invalid-email') {
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
    onSubmit: async (values: EditUserData) => {
      if (!editUser) return;

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
    <TooltipProvider>
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Users
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage user accounts and permissions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => !u.disabled).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Power className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Disabled Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.disabled).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Invite Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowInvite(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-5 py-2.5 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
            >
              <Plus className="w-5 h-5" />
              Invite New User
            </button>
          </div>

          {/* Users Table/Cards */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {fetchingUsers ? (
              <div className="p-8 flex justify-center">
                <Loader size="md" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">No users found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Click &quot;Invite New User&quot; to get started
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          User
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
                      {users.map((user: UserData) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="shrink-0 h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {user.firstname?.[0]}
                                {user.lastname?.[0]}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {user.firstname} {user.lastname}
                                </p>
                                {user.mobile && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {user.mobile}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.disabled
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.disabled ? 'bg-red-500' : 'bg-green-500'}`}
                              ></span>
                              {user.disabled ? 'Disabled' : 'Active'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => setEditUser(user)}
                                    disabled={updatingUser}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit user</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => handleDelete(user.id)}
                                    disabled={deletingUser === user.id}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    {deletingUser === user.id ? (
                                      <Loader size="sm" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete user</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => toggleDisable(user)}
                                    className={`p-2 rounded-lg transition-colors ${
                                      user.disabled
                                        ? 'text-green-600 hover:bg-green-50'
                                        : 'text-yellow-600 hover:bg-yellow-50'
                                    }`}
                                  >
                                    <Power className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {user.disabled
                                      ? 'Enable user'
                                      : 'Disable user'}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View - Visible on mobile */}
                <div className="md:hidden divide-y divide-gray-200">
                  {users.map((user: UserData) => (
                    <div
                      key={user.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="shrink-0 h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {user.firstname?.[0]}
                            {user.lastname?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {user.firstname} {user.lastname}
                            </h3>
                            {user.mobile && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" />
                                <span className="truncate">{user.mobile}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`shrink-0 ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                            user.disabled
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.disabled ? 'Disabled' : 'Active'}
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 flex items-center gap-1 break-all">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span>{user.email}</span>
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => setEditUser(user)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingUser === user.id}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {deletingUser === user.id ? (
                            <Loader size="sm" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Delete
                        </button>
                        <button
                          onClick={() => toggleDisable(user)}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                            user.disabled
                              ? 'text-green-600 bg-green-50 hover:bg-green-100'
                              : 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                          {user.disabled ? 'Enable' : 'Disable'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Users Count */}
                <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                  <p className="text-xs text-gray-500">
                    Showing <span className="font-medium">{users.length}</span>{' '}
                    user{users.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Invite Modal */}
          {showInvite && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Invite User
                    </h2>
                    <button
                      onClick={() => setShowInvite(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <form onSubmit={formik.handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                    </div>
                    <div className="flex gap-3">
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
            </div>
          )}

          {/* Edit Modal */}
          {editUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Edit User
                    </h2>
                    <button
                      onClick={() => setEditUser(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <form onSubmit={editFormik.handleSubmit}>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstname"
                          placeholder="First Name"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          value={editFormik.values.firstname}
                          onChange={editFormik.handleChange}
                          onBlur={editFormik.handleBlur}
                          disabled={updatingUser}
                        />
                        {editFormik.touched.firstname &&
                          editFormik.errors.firstname && (
                            <p className="text-red-500 text-sm mt-1">
                              {editFormik.errors.firstname}
                            </p>
                          )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastname"
                          placeholder="Last Name"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          value={editFormik.values.lastname}
                          onChange={editFormik.handleChange}
                          onBlur={editFormik.handleBlur}
                          disabled={updatingUser}
                        />
                        {editFormik.touched.lastname &&
                          editFormik.errors.lastname && (
                            <p className="text-red-500 text-sm mt-1">
                              {editFormik.errors.lastname}
                            </p>
                          )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          value={editFormik.values.email}
                          disabled
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mobile Number
                        </label>
                        <input
                          type="text"
                          name="mobile"
                          placeholder="Mobile Number"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          value={editFormik.values.mobile}
                          onChange={editFormik.handleChange}
                          onBlur={editFormik.handleBlur}
                          disabled={updatingUser}
                        />
                        {editFormik.touched.mobile &&
                          editFormik.errors.mobile && (
                            <p className="text-red-500 text-sm mt-1">
                              {editFormik.errors.mobile}
                            </p>
                          )}
                      </div>
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
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
