'use client';

import { useEffect, useState } from 'react';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CompleteSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const completeSignIn = async () => {
      try {
        if (isSignInWithEmailLink(auth, window.location.href)) {
          let storedEmail = localStorage.getItem('emailForSignIn');

          if (!storedEmail) {
            storedEmail = prompt('Enter your email');
          }

          setEmail(storedEmail);

          await signInWithEmailLink(auth, storedEmail, window.location.href);

          localStorage.removeItem('emailForSignIn');
        }
      } catch (error) {
        console.error('SIGNIN ERROR:', error);
        alert(error.message);
      } finally {
        setLoading(false);
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

      if (!user) {
        alert('User not found');
        return;
      }

      //  Save user in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        role: 'user',
      });

      alert('Account created!');
      window.location.href = '/';
    } catch (error) {
      console.error('SAVE ERROR:', error);
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
