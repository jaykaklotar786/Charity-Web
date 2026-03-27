/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  updatePassword,
  User,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

// Loader Component
const Loader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 border-t-green-600`}
      ></div>
    </div>
  );
};

export default function CompleteSignup() {
  const [loading, setLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [settingPassword, setSettingPassword] = useState<boolean>(false);

  useEffect(() => {
    const completeSignIn = async (): Promise<void> => {
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
        setLoading(false);
      }
    };

    completeSignIn();
  }, []);

  const handleSubmit = async (): Promise<void> => {
    if (!password) {
      toast.error('Please enter a password');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSettingPassword(true);

    try {
      const user: User | null = auth.currentUser;

      if (!user) {
        toast.error('No user found. Please try again.');
        return;
      }

      await updatePassword(user, password);

      await setDoc(doc(db, 'users', user.uid), {
        email,
        role: 'user',
        createdAt: new Date(),
      });

      toast.success('Account created successfully! Please sign in.');
      window.location.href = '/signin';
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters');
      } else if (error.code === 'auth/requires-recent-login') {
        toast.error('Please sign in again to set your password');
      } else {
        toast.error('Error setting password. Please try again.');
      }
    } finally {
      setSettingPassword(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !settingPassword) {
      handleSubmit();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
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
                d="M12 15v2m-6-4h12m-6-6v2m4-6H8a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Set Your Password
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create a secure password for your account
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              onKeyPress={handleKeyPress}
              disabled={settingPassword}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target.value)
              }
              onKeyPress={handleKeyPress}
              disabled={settingPassword}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={settingPassword || !password || !confirmPassword}
            className="w-full bg-linear-to-r from-green-600 to-green-500 text-white px-4 py-2.5 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center gap-2 font-medium"
          >
            {settingPassword ? (
              <>
                <Loader size="sm" />
                <span>Creating Account...</span>
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Create Account</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            Your password must be at least 6 characters long
          </p>
        </div>
      </div>
    </div>
  );
}
