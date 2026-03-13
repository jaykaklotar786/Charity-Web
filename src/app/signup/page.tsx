'use client';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

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
        });

        router.replace('/signin');
      } catch (error) {
        console.error('Signup error:', error);
        // Handle error (show toast or alert)
      }
    },
  });

  return (
    <div className="max-w-md mx-auto mt-32">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>

      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
        {/* First Name Field */}
        <div className="w-full">
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
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.firstname}
            </div>
          )}
        </div>

        {/* Last Name Field */}
        <div className="w-full">
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
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.lastname}
            </div>
          )}
        </div>

        {/* Email Field */}
        <div className="w-full">
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
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.email}
            </div>
          )}
        </div>

        {/* Mobile Field */}
        <div className="w-full">
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
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.mobile}
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className="w-full">
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
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.password}
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="w-full">
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
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.confirmPassword}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-[#7CB518] text-white p-2 rounded hover:bg-[#6aa014] transition-colors"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
