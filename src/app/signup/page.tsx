/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Define form values type
interface SignupFormValues {
  firstname: string;
  lastname: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

// Validation Schema
const SignupSchema = Yup.object({
  firstname: Yup.string().required('First name required'),
  lastname: Yup.string().required('Last name required'),
  email: Yup.string().email('Invalid email').required('Email required'),
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile must be 10 digits')
    .required('Mobile required'),
  password: Yup.string()
    .min(6, 'Minimum 6 characters')
    .required('Password required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Password must match')
    .required('Confirm password required'),
});

// Loader Component
const Loader = ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => {
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

export default function Signup() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const formik = useFormik<SignupFormValues>({
    initialValues: {
      firstname: '',
      lastname: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: SignupSchema,
    onSubmit: async (values: SignupFormValues) => {
      setSubmitting(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password,
        );

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          firstname: values.firstname,
          lastname: values.lastname,
          email: values.email,
          mobile: values.mobile,
          role: 'user',
          createdAt: new Date(),
        });

        toast.success('Account created successfully! Please sign in.');
        router.replace('/signin');
      } catch (error: any) {
        console.error('Signup error:', error);

        if (error.code === 'auth/email-already-in-use') {
          toast.error('User already exists. Please sign in.');
        } else if (error.code === 'auth/invalid-email') {
          toast.error('Invalid email format');
        } else if (error.code === 'auth/weak-password') {
          toast.error('Password should be at least 6 characters');
        } else if (error.code === 'auth/operation-not-allowed') {
          toast.error('Email/password signup is disabled');
        } else {
          toast.error('Signup failed. Please try again.');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-linear-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Join us and start making a difference
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* First Name & Last Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstname"
                placeholder="First name"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  formik.touched.firstname && formik.errors.firstname
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.firstname}
                disabled={submitting}
              />
              {formik.touched.firstname && formik.errors.firstname && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.firstname}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastname"
                placeholder="Last name"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  formik.touched.lastname && formik.errors.lastname
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.lastname}
                disabled={submitting}
              />
              {formik.touched.lastname && formik.errors.lastname && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.lastname}
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                formik.touched.email && formik.errors.email
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              disabled={submitting}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.email}
              </div>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              name="mobile"
              placeholder="10-digit mobile number"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                formik.touched.mobile && formik.errors.mobile
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.mobile}
              disabled={submitting}
            />
            {formik.touched.mobile && formik.errors.mobile && (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.mobile}
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                formik.touched.password && formik.errors.password
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              disabled={submitting}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.password}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirmPassword}
              disabled={submitting}
            />
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.confirmPassword}
                </div>
              )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-linear-to-r from-green-600 to-green-500 text-white px-4 py-2.5 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center gap-2 font-medium"
          >
            {submitting ? (
              <>
                <Loader size="sm" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <span>Create Account</span>
              </>
            )}
          </button>

          {/* Sign In Link */}
          <p className="text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/signin')}
              className="text-green-600 hover:text-green-700 hover:underline font-medium"
            >
              Sign In
            </button>
          </p>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
