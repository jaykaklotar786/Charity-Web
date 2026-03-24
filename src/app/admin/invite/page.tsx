'use client';

import { useState } from 'react';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

export default function InvitePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const sendInvite = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setLoading(true);

      const actionCodeSettings = {
        url: 'http://localhost:3000/complete-signup',
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, trimmedEmail, actionCodeSettings);

      localStorage.setItem('emailForSignIn', trimmedEmail);

      toast.success('Invite sent! Please check your email.');
      setEmail('');
    } catch (error: any) {
      console.error(error);

      if (error.code === 'auth/quota-exceeded') {
        toast.error('Invite quota exceeded. Try later.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else if (error.code === 'auth/missing-email') {
        toast.error('Email is required');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Invite User</h2>

      <input
        type="email"
        placeholder="Enter email"
        className="border p-2 w-full mb-4 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={sendInvite}
        disabled={loading}
        className="bg-[#7CB518] text-white px-4 py-2 rounded w-full"
      >
        {loading ? 'Sending...' : 'Send Invite'}
      </button>
    </div>
  );
}
