'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.access_token);
        router.push('/');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/google/signin';
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)' }}
    >
      {/* Subtle floating shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#1A73E8] opacity-10 rounded-full filter blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gray-400 opacity-10 rounded-full filter blur-3xl"></div>

      {/* Login Card */}
      <div className="relative max-w-md w-full bg-gray-50 border border-gray-200 rounded-3xl shadow-lg p-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/register" className="font-medium text-[#1A73E8] hover:underline">
              create a new account
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8] sm:text-sm transition-shadow shadow-sm focus:shadow-md"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">📧</span>
            </div>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8] sm:text-sm transition-shadow shadow-sm focus:shadow-md"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">🔒</span>
            </div>
          </div>

          {error && (
            <div className="text-red-700 text-sm text-center bg-red-50 rounded-lg py-2 px-3 border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center rounded-xl bg-[#1A73E8] px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] disabled:opacity-50 transition transform hover:-translate-y-0.5 hover:shadow-2xl"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-600">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-200 transition transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </form>
      </div>
    </div>
  );
}