"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UserDashboard from '@/components/dashboard/UserDashboard';
import BusinessDashboard from '@/components/dashboard/BusinessDashboard';

const DashboardPage = () => {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [userType, setUserType] = useState<'user' | 'business' | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('Dashboard page - currentUser:', currentUser);
    console.log('Dashboard page - loading:', loading);
    
    // If not loading and no user, redirect to sign in
    if (!loading && !currentUser) {
      console.log('No user found, redirecting to signin');
      router.push('/signin');
      return;
    }
    
    // If user exists, use their userType from Firestore
    if (currentUser) {
      console.log('Current user type:', currentUser.userType);
      // Force the user type to be set correctly
      setUserType(currentUser.userType);
    }
    
    setInitialized(true);
  }, [currentUser, loading, router]);

  // Show loading state
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // If no user type determined yet, show nothing (will redirect)
  if (!userType) {
    return null;
  }

  console.log('Rendering dashboard for user type:', userType);
  
  // Render the appropriate dashboard based on user type
  if (userType === 'business') {
    console.log('Rendering BusinessDashboard');
    return <BusinessDashboard />;
  } else {
    console.log('Rendering UserDashboard');
    return <UserDashboard />;
  }
};

export default DashboardPage; 