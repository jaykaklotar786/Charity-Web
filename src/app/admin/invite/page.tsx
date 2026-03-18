'use client';

import { useState } from 'react';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function InvitePage() {
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(true);
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

      alert('Invite link sent!');
      setIsOpen(false);
      setEmail('');
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[350px] shadow-xl relative">
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-3 text-gray-500 text-lg"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Invite User</h2>

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
              className="bg-green-500 text-white w-full py-2 rounded"
            >
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
