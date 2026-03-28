/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import Loader from '@/components/Loader';

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validCode, setValidCode] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const verifyCode = async () => {
      const oobCode = searchParams.get('oobCode');

      if (!oobCode) {
        toast.error('Invalid reset link');
        router.push('/signin');
        return;
      }

      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setEmail(email);
        setValidCode(true);
      } catch (error) {
        console.error('Invalid reset code:', error);
        toast.error('Invalid or expired reset link');
        router.push('/signin');
      } finally {
        setVerifying(false);
      }
    };

    verifyCode();
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const oobCode = searchParams.get('oobCode');
      if (!oobCode) throw new Error('No reset code found');

      await confirmPasswordReset(auth, oobCode, newPassword);

      toast.success('Password reset successfully! Please sign in.');
      router.push('/signin');
    } catch (error: any) {
      console.error('Password reset error:', error);

      if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters');
      } else if (error.code === 'auth/expired-action-code') {
        toast.error('Reset link has expired. Please request a new one.');
      } else {
        toast.error('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!validCode) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
                d="M12 15v2m-6-4h12m-6-6v2m4-6H8a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>

          <p className="text-sm text-gray-500 mt-1">
            Create a new password for {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !newPassword || !confirmPassword}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2.5 rounded-lg hover:from-green-700 hover:to-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size="sm" />
                <span>Resetting...</span>
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
