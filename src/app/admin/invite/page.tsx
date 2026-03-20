'use client';

import { useState } from 'react';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function InvitePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const sendInvite = async () => {
    if (!email) {
      alert('Enter email');
      return;
    }

    try {
      setLoading(true);

      const actionCodeSettings = {
        url: 'http://localhost:3000/complete-signup',
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      localStorage.setItem('emailForSignIn', email);

      alert('Invite sent!');
      setEmail('');
    } catch (error) {
      console.error(error);

      if (error.code === 'auth/quota-exceeded') {
        alert('Daily email limit exceeded');
      } else {
        alert('Error sending invite');
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
