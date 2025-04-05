"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaGoogle, FaUser, FaBuilding } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { BackgroundGradientAnimation } from '@/components/ui/GradientBg';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [userType, setUserType] = useState<'user' | 'business'>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupUserType, setSignupUserType] = useState<'user' | 'business'>('user');
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError('');
    
    // Validate inputs
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    if (userType === 'business' && !businessName) {
      setError('Please enter your business name');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Starting signup process for:', email, 'as', userType);
      
      // Attempt to sign up
      const user = await signUp(email, password, name, userType, businessName);
      console.log('SignUp successful, user type:', user.userType);
      
      // Store the user type for the success message
      setSignupUserType(user.userType);
      
      // Show success message
      setSignupSuccess(true);
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Please choose a stronger password.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
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
      setError('Failed to sign up with Google.');
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  // Show success message if signup was successful
  if (signupSuccess) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
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
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-xl text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Account Created Successfully!</h2>
              <p className="text-white/70">
                Your {signupUserType} account has been created. You can now access your dashboard.
              </p>
            </div>
            
            <button
              onClick={goToDashboard}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg py-3 font-medium hover:opacity-90 transition-opacity"
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

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
              Create Account
            </h1>
            <p className="text-white/70 mt-2">
              Join our community and start exploring
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-white/70 text-sm font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-white/50" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {userType === 'business' && (
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Business Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="text-white/50" />
                  </div>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent"
                    placeholder="Enter your business name"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-white/50" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-white/50" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Create a password"
                />
              </div>
              <p className="text-white/50 text-xs mt-1">
                Password must be at least 6 characters long
              </p>
            </div>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black/40 text-white/50">Or continue with</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white/10 text-white rounded-lg py-3 font-medium hover:bg-white/20 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGoogle />
              <span>Google</span>
            </button>
            
            <p className="text-center text-white/70 text-sm mt-4">
              Already have an account?{' '}
              <Link href="/signin" className="text-pink-400 hover:text-pink-300 transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp; 