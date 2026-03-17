'use client';

import { useState } from 'react';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function InvitePage() {
  const [email, setEmail] = useState('');

  const sendInvite = async () => {
    const actionCodeSettings = {
      url: 'http://localhost:3000/complete-signup',
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);

    // save email locally
    localStorage.setItem('emailForSignIn', email);

    alert('Invite link sent!');
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Invite User</h1>

      <input
        type="email"
        placeholder="Enter email"
        className="border p-2 mr-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={sendInvite} className="bg-blue-500 text-white px-4 py-2">
        Send Invite
      </button>
    </div>
  );
}
