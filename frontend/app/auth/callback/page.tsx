'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          setStatus('error');
          setMessage('No authentication token received. Redirecting...');
          setTimeout(() => router.push('/auth/login'), 3000);
          return;
        }

        localStorage.setItem('auth_token', token);
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        setTimeout(() => router.push('/profile'), 2000);
      } catch {
        setStatus('error');
        setMessage('An error occurred. Redirecting...');
        setTimeout(() => router.push('/auth/login'), 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)' }}
    >
      {/* Subtle floating shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#1A73E8] opacity-10 rounded-full filter blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gray-400 opacity-10 rounded-full filter blur-3xl"></div>

      {/* Status Card */}
      <div className="relative max-w-md w-full bg-gray-50 border border-gray-200 rounded-3xl shadow-lg p-8 space-y-8 text-center">
        {status === 'processing' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-900">Processing Authentication</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-900">Authentication Successful!</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-900">Authentication Failed</h2>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="mt-4 px-4 py-2 bg-[#1A73E8] text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] transition"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}