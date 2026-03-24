'use client';

import { useEffect, useState } from 'react';
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  updatePassword,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function CompleteSignup() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const completeSignIn = async () => {
      try {
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          setLoading(false);
          return;
        }

        let storedEmail = localStorage.getItem('emailForSignIn');

        if (!storedEmail) {
          storedEmail = prompt('Enter your email');
        }

        if (!storedEmail) {
          toast.error('Email is required to complete signup');
          setLoading(false);
          return;
        }

        const result = await signInWithEmailLink(
          auth,
          storedEmail,
          window.location.href,
        );

        console.log('SIGNED IN:', result.user.uid);

        setEmail(storedEmail);

        // clear storage
        localStorage.removeItem('emailForSignIn');
      } catch (error) {
        console.error('ERROR:', error);
        toast.error('Failed to complete signup. Please try again.');
      } finally {
        setLoading(false); // 🔥 IMPORTANT
      }
    };

    completeSignIn();
  }, []);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const user = auth.currentUser;

      await updatePassword(user, password);

      await setDoc(doc(db, 'users', user.uid), {
        email,
        role: 'user',
      });

      toast.success('Account created successfully! Please sign in.');

      window.location.href = '/signin';
    } catch (error) {
      console.error(error);
      toast.error('Error setting password');
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Set Your Password
        </h1>

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="border p-2 w-full mb-4 rounded"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="bg-[#7CB518] text-white w-full py-2 rounded hover:bg-[#6aa014]"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
