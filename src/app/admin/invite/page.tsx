'use client';

import { useState } from 'react';
import { sendSignInLinkToEmail, AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

// Loader Component
const Loader = ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 border-t-green-600`}
      ></div>
    </div>
  );
};

export default function InvitePage() {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const sendInvite = async (): Promise<void> => {
    const trimmedEmail: string = email.trim();

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
    } catch (error: unknown) {
      console.error(error);

      const authError = error as AuthError;

      if (authError.code === 'auth/quota-exceeded') {
        toast.error('Invite quota exceeded. Try later.');
      } else if (authError.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else if (authError.code === 'auth/missing-email') {
        toast.error('Email is required');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !loading) {
      sendInvite();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-linear-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Invite User</h2>
          <p className="text-sm text-gray-500 mt-1">
            Send an invitation email to join your organization
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter email address"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              onKeyPress={handleKeyPress}
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Press Enter to quickly send invite
            </p>
          </div>

          <button
            onClick={sendInvite}
            disabled={loading || !email.trim()}
            className="w-full bg-linear-to-r from-green-600 to-green-500 text-white px-4 py-2.5 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <Loader size="sm" />
                <span>Sending Invite...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>Send Invite</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            The user will receive an email with a link to complete their signup
          </p>
        </div>
      </div>
    </div>
  );
}
