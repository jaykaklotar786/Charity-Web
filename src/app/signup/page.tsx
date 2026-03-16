'use client';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SignupSchema = Yup.object({
  firstname: Yup.string().required('First name required'),
  lastname: Yup.string().required('Last name required'),
  email: Yup.string().email('Invalid email').required('Email required'),
  mobile: Yup.string().required('Mobile required'),
  password: Yup.string().min(6, 'Minimum 6 characters').required(),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Password must match')
    .required(),
});

export default function Signup() {
  const router = useRouter();
  const [signupError, setSignupError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const formik = useFormik({
    initialValues: {
      firstname: '',
      lastname: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: SignupSchema,
    onSubmit: async (values) => {
      try {
        setSignupError('');

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
        });

        router.replace('/signin');
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          setSignupError('User already exists. Please sign in.');
        } else if (error.code === 'auth/invalid-email') {
          setSignupError('Invalid email format');
        } else if (error.code === 'auth/weak-password') {
          setSignupError('Password should be at least 6 characters');
        } else {
          setSignupError('Signup failed. Please try again.');
        }
      }
    },
  });

  return (
    <div className="max-w-md mx-auto mt-32">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>

      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
        {signupError && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
            {signupError}
          </div>
        )}

        {/* First Name */}
        <div>
          <input
            type="text"
            name="firstname"
            placeholder="First Name"
            className="border p-2 w-full"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.firstname}
          />
          {formik.touched.firstname && formik.errors.firstname && (
            <div className="text-red-500 text-sm">
              {formik.errors.firstname}
            </div>
          )}
        </div>

        {/* Last Name */}
        <div>
          <input
            type="text"
            name="lastname"
            placeholder="Last Name"
            className="border p-2 w-full"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.lastname}
          />
          {formik.touched.lastname && formik.errors.lastname && (
            <div className="text-red-500 text-sm">{formik.errors.lastname}</div>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="border p-2 w-full"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-red-500 text-sm">{formik.errors.email}</div>
          )}
        </div>

        {/* Mobile */}
        <div>
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile"
            className="border p-2 w-full"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.mobile}
          />
          {formik.touched.mobile && formik.errors.mobile && (
            <div className="text-red-500 text-sm">{formik.errors.mobile}</div>
          )}
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="border p-2 w-full"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password && (
            <div className="text-red-500 text-sm">{formik.errors.password}</div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="border p-2 w-full"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <div className="text-red-500 text-sm">
              {formik.errors.confirmPassword}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="bg-[#7CB518] text-white p-2 rounded hover:bg-[#6aa014]"
        >
          {formik.isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <p className="text-center text-gray-600 mt-4">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => router.push('/signin')}
          className="text-[#7CB518] hover:underline"
        >
          Sign In
        </button>
      </p>
    </div>
  );
}
