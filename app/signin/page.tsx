"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaGoogle, FaUser, FaBuilding } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { BackgroundGradientAnimation } from '@/components/ui/GradientBg';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'user' | 'business'>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signIn(email, password, userType);
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background animation */}
      <BackgroundGradientAnimation 
        gradientBackgroundStart="rgb(0, 0, 0)"
        gradientBackgroundEnd="rgb(0, 0, 0)"
        firstColor="0, 0, 0"
        secondColor="0, 0, 0"
        thirdColor="0, 0, 0"
        fourthColor="0, 0, 0"
        fifthColor="0, 0, 0"
        pointerColor="0, 0, 0"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-300 via-pink-400 to-purple-300 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-white/70 mt-2">
              Sign in to continue to your dashboard
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-200 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Account Type
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setUserType('user')}
                  className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                    userType === 'user' 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <FaUser />
                  <span>User</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('business')}
                  className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                    userType === 'business' 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <FaBuilding />
                  <span>Business</span>
                </button>
              </div>
            </div>

            <div>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-3 text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-3 text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-white/40">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 flex items-center justify-center gap-2 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGoogle />
              Google
            </button>
          </form>

          <p className="mt-6 text-center text-white/60">
            Don't have an account?{' '}
            <Link 
              href="/signup"
              className="text-pink-400 hover:text-pink-300 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn; 