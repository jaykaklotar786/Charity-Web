'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

// Validation Schema
const SigninSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function Signin() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('LOGIN UID:', auth.currentUser?.uid);
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-32">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>

      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={SigninSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const userCredential = await signInWithEmailAndPassword(
              auth,
              values.email,
              values.password,
            );

            const uid = userCredential.user.uid;

            //  FIRESTORE CHECK
            const userDoc = await getDoc(doc(db, 'users', uid));

            if (userDoc.exists() && userDoc.data().disabled) {
              await auth.signOut(); // logout immediately
              toast.error('Your account has been disabled by admin');
              return;
            }
            router.push('/');
            toast.success('Logged in successfully');
          } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
              toast.error('User does not exist');
            } else if (error.code === 'auth/wrong-password') {
              toast.error('Incorrect password');
            } else if (error.code === 'auth/invalid-credential') {
              toast.error('User Not Found or Wrong Password');
            } else {
              toast.error('Login failed. Please try again.');
            }
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="w-full">
              <Field
                name="email"
                type="email"
                placeholder="Email"
                className={`border p-2 w-full ${
                  touched.email && errors.email ? 'border-red-500' : ''
                }`}
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Password Field */}
            <div className="w-full">
              <Field
                name="password"
                type="password"
                placeholder="Password"
                className={`border p-2 w-full ${
                  touched.password && errors.password ? 'border-red-500' : ''
                }`}
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#7CB518] text-white p-2 rounded hover:bg-[#6aa014] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

            {/* Optional: Sign Up Link */}
            <p className="text-center text-gray-600 mt-4">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/signup')}
                className="text-[#7CB518] hover:underline"
              >
                Sign Up
              </button>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
}
