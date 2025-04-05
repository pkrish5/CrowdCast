"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

type UserType = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  userType: 'user' | 'business';
  favoriteBusinesses?: string[];
};

type AuthContextType = {
  currentUser: UserType | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, userType: 'user' | 'business', businessName?: string) => Promise<UserType>;
  signIn: (email: string, password: string, userType: 'user' | 'business') => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserType>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Fetch user data from Firestore
  const fetchUserData = async (user: User): Promise<UserType> => {
    try {
      // Get user document
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      // Determine user type
      let userType: 'user' | 'business';
      let favoriteBusinesses: string[] | undefined;
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Use the explicitly set userType from the user document
        userType = userData.userType === 'business' ? 'business' : 'user';
        
        // Only include favoriteBusinesses for user type
        if (userType === 'user') {
          favoriteBusinesses = userData.favoriteBusinesses || [];
        }
      } else {
        // Default to user type if no document exists
        userType = 'user';
        favoriteBusinesses = [];
      }
      
      // Create user object
      const userObj: UserType = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        userType: userType,
        favoriteBusinesses: favoriteBusinesses
      };
      
      console.log('Fetched user data:', userObj);
      return userObj;
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Return a default user object in case of error
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        userType: 'user',
        favoriteBusinesses: []
      };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string, userType: 'user' | 'business', businessName?: string): Promise<UserType> => {
    try {
      console.log('Starting signup process for:', email, 'as', userType);
      
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Firebase auth user created:', user.uid);
      
      // Update profile with display name
      await updateProfile(user, { displayName: name });
      console.log('User profile updated with name:', name);
      
      // Create user document in Firestore
      const userData: any = {
        email,
        displayName: name,
        userType,
        createdAt: new Date().toISOString()
      };
      
      // Only add favoriteBusinesses for user type
      if (userType === 'user') {
        userData.favoriteBusinesses = [];
      }
      
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('User document created in Firestore with userType:', userType);

      // If signing up as a business, create business document
      if (userType === 'business') {
        console.log('Creating business document for:', user.uid);
        await setDoc(doc(db, 'businesses', user.uid), {
          name: businessName || name, // Use businessName if provided, otherwise use personal name
          email,
          description: '',
          address: '',
          phone: '',
          website: '',
          category: '',
          openingHours: '',
          capacity: 100,
          currentOccupancy: 0,
          peakOccupancy: 0,
          averageOccupancy: 0,
          totalVisitors: 0,
          revenue: 0,
          surveyResults: {},
          subscriptionTier: 'basic',
          surveyLimit: 5,
          surveysCreated: 0,
          incentives: [],
          aitriosData: {
            deviceId: '',
            lastUpdated: new Date().toISOString(),
            status: 'inactive',
            metrics: {
              totalCount: 0,
              averageCount: 0,
              peakCount: 0,
              occupancyRate: 0,
              dwellTime: 0
            }
          }
        });
        console.log('Business document created successfully');
      }
      
      // Create user object
      const newUser: UserType = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        userType: userType,
        favoriteBusinesses: userType === 'user' ? [] : undefined
      };
      
      // Set current user
      setCurrentUser(newUser);
      console.log('Current user set with type:', userType);
      
      return newUser;
    } catch (error) {
      console.error('Error during sign up:', error);
      throw error;
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string, userType: 'user' | 'business'): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }
      
      const userData = userDoc.data();
      if (userData.userType !== userType) {
        throw new Error(`Invalid account type. Please sign in as a ${userData.userType}`);
      }
      
      const user = await fetchUserData(userCredential.user);
      setCurrentUser(user);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          // Default to user type, they can update later
          userType: 'user',
          favoriteBusinesses: []
        });
      }
      
      const userData = await fetchUserData(user);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // Sign out
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserType>): Promise<void> => {
    if (!currentUser) return;
    
    try {
      // Update Firestore document
      await setDoc(doc(db, 'users', currentUser.uid), {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      // Update local state
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Initialize auth state
  useEffect(() => {
    if (authInitialized) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If we already have a currentUser with the same ID, don't fetch again
        if (currentUser && currentUser.uid === user.uid) {
          console.log('Using existing user data for:', user.uid);
          setLoading(false);
          return;
        }
        
        // Fetch user data
        const userData = await fetchUserData(user);
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, [authInitialized, currentUser]);

  const value = {
    currentUser,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 