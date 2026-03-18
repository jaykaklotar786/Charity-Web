'use client';

import { useEffect, useState } from 'react';
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  updatePassword,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CompleteSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const completeSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let storedEmail = localStorage.getItem('emailForSignIn');

        if (!storedEmail) {
          storedEmail = prompt('Enter your email');
        }

        // ✅ Step 1: Sign in user
        const result = await signInWithEmailLink(
          auth,
          storedEmail,
          window.location.href,
        );

        console.log('User signed in:', result.user.uid);
      }
    };

    completeSignIn();
  }, []);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const user = auth.currentUser;

      // 🔥 IMPORTANT LINE
      await updatePassword(user, password);

      alert('Password set successfully!');

      window.location.href = '/login';
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  if (loading) {
    return <p className="p-10">Loading...</p>;
  }

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl mb-4 font-bold">Set Password</h1>

      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-full mb-3 rounded"
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        className="border p-2 w-full mb-3 rounded"
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 w-full rounded"
      >
        Create Account
      </button>
    </div>
  );
}
