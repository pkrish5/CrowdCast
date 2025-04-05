"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  FaSearch, 
  FaStar, 
  FaRegStar, 
  FaUsers, 
  FaChartLine, 
  FaMapMarkerAlt, 
  FaClock, 
  FaArrowRight,
  FaArrowLeft,
  FaGift,
  FaTrophy,
  FaPoll,
  FaMedal,
  FaTimes,
  FaHeart,
  FaCopyright,
  FaTrain,
  FaBus,
  FaSubway,
  FaWalking,
  FaBicycle,
  FaCar,
  FaStore
} from 'react-icons/fa';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Survey from './Survey';
import BackgroundAnimation from '@/components/ui/BackgroundAnimation';
import Link from 'next/link';
import BusinessGrid from './BusinessGrid';
import { useTransportationData } from '@/hooks/useTransportationData';
import TransportationSection from '@/components/business/TransportationSection';
import { useAitriosData } from '@/hooks/useAitriosData';
import { ResponsiveLine } from '@nivo/line';

type Business = {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  occupancy: number;
  waitTime: number;
  currentOccupancy: number;
  maxCapacity: number;
  isFavorite: boolean;
  hasSurvey: boolean;
  surveyPoints: number;
  incentives?: {
    id: string;
    title: string;
    description: string;
    points: number;
    active: boolean;
    claimed?: boolean;
  }[];
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  points: number;
  completed: boolean;
  completedAt?: string;
};

type Reward = {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ReactNode;
  claimed: boolean;
};

type OccupancyHistoryItem = {
  time: string;
  occupancy: number;
};

type TransportOption = {
  id: string;
  type: 'train' | 'bus' | 'subway' | 'walking';
  name: string;
  duration: string;
  crowdLevel: number; // 0-100
  frequency: string;
  stops: number;
};

type Incentive = {
  id: string;
  title: string;
  description: string;
  points: number;
  active: boolean;
  claimed?: boolean;
};

const UserDashboard = () => {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [favoriteBusinesses, setFavoriteBusinesses] = useState<string[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedBusinessName, setSelectedBusinessName] = useState<string | null>(null);
  const [occupancyHistory, setOccupancyHistory] = useState<OccupancyHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'favorites' | 'incentives' | 'transportation'>('discover');
  const [userPoints, setUserPoints] = useState(0);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [userRewards, setUserRewards] = useState<Reward[]>([]);
  const [showIncentives, setShowIncentives] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [selectedBusinessForSurvey, setSelectedBusinessForSurvey] = useState<string | null>(null);
  const [completedSurveys, setCompletedSurveys] = useState<string[]>([]);
  const [surveysCompletedToday, setSurveysCompletedToday] = useState(0);
  const [lastSurveyDate, setLastSurveyDate] = useState<string | null>(null);
  const dailySurveyLimit = 3;
  
  // Transportation data
  const { transportOptions, loading: transportLoading, error: transportError } = useTransportationData(selectedBusiness?.id || '');
  
  // Add Aitrios data hook with selected business
  const { stats: aitriosStats, loading: aitriosLoading } = useAitriosData(selectedBusiness?.id || '');

  // Fetch user's favorite businesses and survey data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const favorites = userData.favoriteBusinesses || [];
          setFavoriteBusinesses(favorites);
          
          // Get completed surveys
          const completed = userData.completedSurveys || [];
          setCompletedSurveys(completed);
          
          // Get user points
          if (userData.points) {
            setUserPoints(userData.points);
          }
          
          // Get last survey date
          if (userData.lastSurveyDate) {
            setLastSurveyDate(userData.lastSurveyDate);
            
            // Check if last survey was today
            const today = new Date().toISOString().split('T')[0];
            const lastDate = new Date(userData.lastSurveyDate).toISOString().split('T')[0];
            
            if (lastDate === today) {
              // Count surveys completed today
              const todaySurveys = Object.entries(userData.surveyAnswers || {}).filter(([_, data]: [string, any]) => 
                new Date(data.completedAt).toISOString().split('T')[0] === today
              ).length;
              
              setSurveysCompletedToday(todaySurveys);
            } else {
              setSurveysCompletedToday(0);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser]);

  // Fetch businesses data
  useEffect(() => {
    const loadBusinesses = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const businessesRef = collection(db, 'businesses');
        const q = query(businessesRef, where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);
        
        let businessesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          surveyPoints: doc.data().surveyPoints || 50,
          isFavorite: favoriteBusinesses.includes(doc.id),
          hasSurvey: true,
          currentOccupancy: doc.data().currentOccupancy || 0,
          maxCapacity: doc.data().maxCapacity || 100,
          occupancy: doc.data().occupancyPercentage || 0,
          waitTime: doc.data().waitTime || 0,
          rating: doc.data().rating || 4.5,
          reviews: doc.data().reviews || 0
        })) as Business[];
        
        // If no businesses are fetched, use mock data
        if (businessesData.length === 0) {
          console.log('No businesses found in Firestore, using mock data');
          businessesData = [
            {
              id: 'mock1',
              name: 'Coffee Shop',
              category: 'Café',
              description: 'A cozy coffee shop with great pastries',
              location: '123 Main St',
              rating: 4.5,
              reviews: 120,
              imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
              occupancy: 65,
              waitTime: 10,
              currentOccupancy: 65,
              maxCapacity: 100,
              isFavorite: false,
              hasSurvey: true,
              surveyPoints: 50,
              incentives: [
                {
                  id: 'inc1',
                  title: 'Free Coffee',
                  description: 'Get a free coffee after completing 5 surveys',
                  points: 250,
                  active: true
                }
              ]
            },
            {
              id: 'mock2',
              name: 'Pizza Place',
              category: 'Restaurant',
              description: 'Best pizza in town with a variety of toppings',
              location: '456 Oak Ave',
              rating: 4.7,
              reviews: 85,
              imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
              occupancy: 80,
              waitTime: 15,
              currentOccupancy: 80,
              maxCapacity: 100,
              isFavorite: false,
              hasSurvey: true,
              surveyPoints: 75,
              incentives: [
                {
                  id: 'inc2',
                  title: 'Free Slice',
                  description: 'Get a free slice of pizza after completing 3 surveys',
                  points: 150,
                  active: true
                }
              ]
            },
            {
              id: 'mock3',
              name: 'Bookstore',
              category: 'Retail',
              description: 'Independent bookstore with rare editions',
              location: '789 Pine St',
              rating: 4.3,
              reviews: 45,
              imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
              occupancy: 30,
              waitTime: 0,
              currentOccupancy: 30,
              maxCapacity: 100,
              isFavorite: false,
              hasSurvey: true,
              surveyPoints: 50,
              incentives: [
                {
                  id: 'inc3',
                  title: '10% Discount',
                  description: 'Get 10% off your next purchase after completing 2 surveys',
                  points: 100,
                  active: true
                }
              ]
            }
          ];
        }
        
        console.log('Fetched businesses:', businessesData);
        setBusinesses(businessesData);
      } catch (error) {
        console.error('Error fetching businesses:', error);
        
        // Use mock data if there's an error
        console.log('Error fetching businesses, using mock data');
        const mockBusinesses = [
          {
            id: 'mock1',
            name: 'Coffee Shop',
            category: 'Café',
            description: 'A cozy coffee shop with great pastries',
            location: '123 Main St',
            rating: 4.5,
            reviews: 120,
            imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            occupancy: 65,
            waitTime: 10,
            currentOccupancy: 65,
            maxCapacity: 100,
            isFavorite: false,
            hasSurvey: true,
            surveyPoints: 50,
            incentives: [
              {
                id: 'inc1',
                title: 'Free Coffee',
                description: 'Get a free coffee after completing 5 surveys',
                points: 250,
                active: true
              }
            ]
          },
          {
            id: 'mock2',
            name: 'Pizza Place',
            category: 'Restaurant',
            description: 'Best pizza in town with a variety of toppings',
            location: '456 Oak Ave',
            rating: 4.7,
            reviews: 85,
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            occupancy: 80,
            waitTime: 15,
            currentOccupancy: 80,
            maxCapacity: 100,
            isFavorite: false,
            hasSurvey: true,
            surveyPoints: 75,
            incentives: [
              {
                id: 'inc2',
                title: 'Free Slice',
                description: 'Get a free slice of pizza after completing 3 surveys',
                points: 150,
                active: true
              }
            ]
          },
          {
            id: 'mock3',
            name: 'Bookstore',
            category: 'Retail',
            description: 'Independent bookstore with rare editions',
            location: '789 Pine St',
            rating: 4.3,
            reviews: 45,
            imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            occupancy: 30,
            waitTime: 0,
            currentOccupancy: 30,
            maxCapacity: 100,
            isFavorite: false,
            hasSurvey: true,
            surveyPoints: 50,
            incentives: [
              {
                id: 'inc3',
                title: '10% Discount',
                description: 'Get 10% off your next purchase after completing 2 surveys',
                points: 100,
                active: true
              }
            ]
          }
        ];
        setBusinesses(mockBusinesses);
      } finally {
        setLoading(false);
      }
    };
    
    loadBusinesses();
  }, [currentUser, favoriteBusinesses]);

  // Update business data with real-time occupancy
  useEffect(() => {
    if (selectedBusiness && aitriosStats) {
      setBusinesses(prevBusinesses => 
        prevBusinesses.map(business => 
          business.id === selectedBusiness.id
            ? {
                ...business,
                occupancy: aitriosStats.occupancyPercentage,
                currentOccupancy: aitriosStats.currentOccupancy,
                maxCapacity: aitriosStats.maxCapacity,
                waitTime: Math.round(aitriosStats.occupancyPercentage / 10) // Estimate wait time based on occupancy
              }
            : business
        )
      );
    }
  }, [selectedBusiness, aitriosStats]);

  // Handle survey completion
  const handleSurveyComplete = async (businessId: string, points: number) => {
    if (!currentUser) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const userRef = doc(db, 'users', currentUser.uid);
      
      await updateDoc(userRef, {
        points: increment(points),
        completedSurveys: arrayUnion(businessId),
        lastSurveyDate: today
      });

      setUserPoints(prev => prev + points);
      setCompletedSurveys(prev => [...prev, businessId]);
      setSurveysCompletedToday(prev => prev + 1);
      setLastSurveyDate(today);
      setSurveyModalOpen(false);
      // Refresh business data to update survey status
      const businessesRef = collection(db, 'businesses');
      const q = query(businessesRef, where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);
      
      let businessesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        surveyPoints: doc.data().surveyPoints || 50,
        isFavorite: favoriteBusinesses.includes(doc.id),
        hasSurvey: true,
        currentOccupancy: doc.data().currentOccupancy || 0,
        maxCapacity: doc.data().maxCapacity || 100,
        occupancy: doc.data().occupancyPercentage || 0,
        waitTime: doc.data().waitTime || 0,
        rating: doc.data().rating || 4.5,
        reviews: doc.data().reviews || 0
      })) as Business[];
      
      // If no businesses are fetched, use mock data
      if (businessesData.length === 0) {
        console.log('No businesses found in Firestore, using mock data');
        businessesData = [
          {
            id: 'mock1',
            name: 'Coffee Shop',
            category: 'Café',
            description: 'A cozy coffee shop with great pastries',
            location: '123 Main St',
            rating: 4.5,
            reviews: 120,
            imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            occupancy: 65,
            waitTime: 10,
            currentOccupancy: 65,
            maxCapacity: 100,
            isFavorite: false,
            hasSurvey: true,
            surveyPoints: 50,
            incentives: [
              {
                id: 'inc1',
                title: 'Free Coffee',
                description: 'Get a free coffee after completing 5 surveys',
                points: 250,
                active: true
              }
            ]
          },
          {
            id: 'mock2',
            name: 'Pizza Place',
            category: 'Restaurant',
            description: 'Best pizza in town with a variety of toppings',
            location: '456 Oak Ave',
            rating: 4.7,
            reviews: 85,
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            occupancy: 80,
            waitTime: 15,
            currentOccupancy: 80,
            maxCapacity: 100,
            isFavorite: false,
            hasSurvey: true,
            surveyPoints: 75,
            incentives: [
              {
                id: 'inc2',
                title: 'Free Slice',
                description: 'Get a free slice of pizza after completing 3 surveys',
                points: 150,
                active: true
              }
            ]
          },
          {
            id: 'mock3',
            name: 'Bookstore',
            category: 'Retail',
            description: 'Independent bookstore with rare editions',
            location: '789 Pine St',
            rating: 4.3,
            reviews: 45,
            imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
            occupancy: 30,
            waitTime: 0,
            currentOccupancy: 30,
            maxCapacity: 100,
            isFavorite: false,
            hasSurvey: true,
            surveyPoints: 50,
            incentives: [
              {
                id: 'inc3',
                title: '10% Discount',
                description: 'Get 10% off your next purchase after completing 2 surveys',
                points: 100,
                active: true
              }
            ]
          }
        ];
      }
      
      console.log('Refreshed businesses after survey:', businessesData);
      setBusinesses(businessesData);
    } catch (error) {
      console.error('Error updating survey data:', error);
    }
  };

  // Toggle favorite business
  const handleToggleFavorite = async (businessId: string) => {
    if (!currentUser) return;
    
    try {
      const isCurrentlyFavorite = favoriteBusinesses.includes(businessId);
      const userRef = doc(db, 'users', currentUser.uid);
      
      if (isCurrentlyFavorite) {
        await updateDoc(userRef, {
          favoriteBusinesses: arrayRemove(businessId)
        });
        setFavoriteBusinesses(prev => prev.filter(id => id !== businessId));
      } else {
        await updateDoc(userRef, {
          favoriteBusinesses: arrayUnion(businessId)
        });
        setFavoriteBusinesses(prev => [...prev, businessId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Filter businesses based on search term
  const filteredBusinesses = businesses.filter(business => 
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get occupancy percentage
  const getOccupancyPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  // Get occupancy status color
  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get occupancy status text
  const getOccupancyStatus = (percentage: number) => {
    if (percentage >= 90) return 'Very Crowded';
    if (percentage >= 70) return 'Moderately Crowded';
    if (percentage >= 30) return 'Normal';
    return 'Quiet';
  };

  const handleSurveyClick = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    if (business) {
      setSelectedBusiness(business);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const reward = userRewards.find(r => r.id === rewardId);
      
      if (reward && userPoints >= reward.points) {
        await updateDoc(userRef, {
          points: increment(-reward.points),
          claimedRewards: arrayUnion(rewardId)
        });
        
        setUserPoints(prev => prev - reward.points);
        setUserRewards(prev => prev.map(r => 
          r.id === rewardId ? { ...r, claimed: true } : r
        ));
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Update the business card click handler
  const handleBusinessClick = (businessId: string, businessName: string) => {
    setSelectedBusiness(businesses.find(b => b.id === businessId) || null);
    setSelectedBusinessName(businessName);
    setActiveTab('transportation');
  };

  // Update the business card rendering in the discover tab
  const renderDiscoverTab = () => {
    console.log('Rendering discover tab with businesses:', businesses);
    
    if (businesses.length === 0) {
      return (
        <div className="text-center py-12">
          <FaStore className="mx-auto text-4xl text-white/30 mb-4" />
          <p className="text-white/50">No businesses available at the moment</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((business) => (
          <motion.div
            key={business.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => handleBusinessClick(business.id, business.name)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{business.name}</h3>
                <p className="text-white/70">{business.category}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(business.id);
                }}
                className="text-pink-500 hover:text-pink-400 transition-colors"
              >
                {favoriteBusinesses.includes(business.id) ? (
                  <FaHeart className="text-xl" />
                ) : (
                  <FaHeart className="text-xl text-white/30" />
                )}
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-white/70">
                <FaUsers className="mr-2" />
                <span>{business.occupancy}% Occupied</span>
              </div>
              <div className="flex items-center text-white/70">
                <FaClock className="mr-2" />
                <span>{business.waitTime} min wait</span>
              </div>
              <div className="flex items-center text-white/70">
                <FaMapMarkerAlt className="mr-2" />
                <span>{business.location}</span>
              </div>
            </div>
            
            {business.hasSurvey && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSurveyClick(business.id);
                }}
                className="mt-4 w-full bg-pink-500/50 hover:bg-pink-500/70 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <FaPoll />
                <span>Complete Survey ({business.surveyPoints} points)</span>
              </button>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  // Get crowd level color
  const getCrowdLevelColor = (level: number) => {
    if (level <= 30) return 'bg-green-500/20 text-green-400';
    if (level <= 70) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  // Get crowd level text
  const getCrowdLevelText = (level: number) => {
    if (level <= 30) return 'Low Crowd';
    if (level <= 70) return 'Moderate Crowd';
    return 'High Crowd';
  };

  // Get transport icon
  const getTransportIcon = (type: 'train' | 'bus' | 'subway' | 'walking') => {
    switch (type) {
      case 'train':
        return <FaTrain className="text-xl" />;
      case 'bus':
        return <FaBus className="text-xl" />;
      case 'subway':
        return <FaSubway className="text-xl" />;
      case 'walking':
        return <FaWalking className="text-xl" />;
    }
  };

  // Update the occupancy history chart
  const renderOccupancyHistory = () => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-white">Occupancy History</h3>
      <div className="h-64">
        <ResponsiveLine
          data={[
            {
              id: 'occupancy',
              data: aitriosStats.history.map((item, index) => ({
                x: index,
                y: item.occupancy
              }))
            }
          ]}
          margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
          xScale={{ type: 'linear' }}
          yScale={{ type: 'linear', min: 0, max: aitriosStats.maxCapacity }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Time',
            legendOffset: 36,
            legendPosition: 'middle'
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Occupancy',
            legendOffset: -40,
            legendPosition: 'middle'
          }}
          pointSize={10}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          useMesh={true}
          theme={{
            axis: {
              ticks: {
                text: {
                  fill: 'rgba(255, 255, 255, 0.7)'
                }
              },
              legend: {
                text: {
                  fill: 'rgba(255, 255, 255, 0.7)'
                }
              }
            },
            grid: {
              line: {
                stroke: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }}
        />
      </div>
    </div>
  );

  // Memoize the transportation tab to prevent unnecessary re-renders
  const transportationTab = useMemo(() => {
    if (!selectedBusiness) {
      return (
        <div className="text-center py-12">
          <FaBus className="mx-auto text-4xl text-white/30 mb-4" />
          <p className="text-white/50">Select a business to view transportation options</p>
        </div>
      );
    }

    if (transportLoading || aitriosLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      );
    }

    if (transportError) {
      return (
        <div className="text-center py-12">
          <p className="text-red-400">Error loading transportation data: {transportError}</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Selected Business Info */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Selected Business</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-white">{selectedBusinessName}</p>
              <p className="text-white/70">View transportation options and occupancy</p>
            </div>
            <button
              onClick={() => setSelectedBusiness(null)}
              className="text-white/70 hover:text-white transition-colors"
            >
              Change Business
            </button>
          </div>
        </div>

        {/* Occupancy Section */}
        <motion.div 
          className="bg-white/5 border border-white/10 rounded-xl p-6"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-white">Current Occupancy</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <motion.p 
                  className="text-3xl font-bold text-white"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {aitriosStats.currentOccupancy}
                </motion.p>
                <p className="text-sm text-white/70">Current Occupancy</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{aitriosStats.maxCapacity}</p>
                <p className="text-sm text-white/70">Max Capacity</p>
              </div>
            </div>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <motion.span 
                    className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {aitriosStats.occupancyPercentage}% Occupied
                  </motion.span>
                </div>
                <div className="text-right">
                  <motion.span 
                    className={`text-xs font-semibold inline-block ${
                      aitriosStats.status === 'normal' ? 'text-green-600' :
                      aitriosStats.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {aitriosStats.status === 'normal' ? 'Normal' : 
                     aitriosStats.status === 'warning' ? 'Warning' : 'Critical'}
                  </motion.span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <motion.div
                  style={{ width: `${aitriosStats.occupancyPercentage}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    aitriosStats.status === 'normal' ? 'bg-green-500' :
                    aitriosStats.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  animate={{ width: `${aitriosStats.occupancyPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
            
            <div className="text-sm text-white/70">
              Last updated: {aitriosStats.lastUpdate}
            </div>
          </div>
        </motion.div>

        {/* Transportation Options */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Transportation Options</h3>
          <TransportationSection transportOptions={transportOptions} />
        </div>
      </div>
    );
  }, [selectedBusiness, selectedBusinessName, transportLoading, aitriosLoading, transportError, transportOptions, aitriosStats]);

  const renderIncentives = () => {
    if (!selectedBusiness?.incentives) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white/5 rounded-lg p-6 mb-8"
      >
        <h3 className="text-xl font-semibold mb-4">Available Incentives</h3>
        <div className="grid gap-4">
          {selectedBusiness.incentives.map(incentive => (
            <div
              key={incentive.id}
              className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <h4 className="font-medium">{incentive.title}</h4>
                <p className="text-white/70 text-sm">{incentive.description}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-pink-500">{incentive.points} points</span>
                <button
                  onClick={() => handleClaimReward(incentive.id)}
                  disabled={userPoints < incentive.points || incentive.claimed}
                  className={`px-4 py-2 rounded-lg ${
                    userPoints >= incentive.points && !incentive.claimed
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  {incentive.claimed ? 'Claimed' : 'Claim'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderAchievements = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white/5 rounded-lg p-6 mb-8"
      >
        <h3 className="text-xl font-semibold mb-4">Achievements</h3>
        <div className="grid grid-cols-2 gap-4">
          {userAchievements.map(achievement => (
            <div
              key={achievement.id}
              className={`bg-white/5 rounded-lg p-4 ${
                achievement.completed ? 'border-2 border-pink-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                {achievement.icon}
                <h4 className="font-medium">{achievement.title}</h4>
              </div>
              <p className="text-white/70 text-sm mb-2">{achievement.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-pink-500">{achievement.points} points</span>
                {achievement.completed && (
                  <span className="text-green-400 text-sm">
                    Completed {achievement.completedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-300 bg-clip-text text-transparent">
                LoyaltyLoop
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <BackgroundAnimation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-300 via-pink-400 to-purple-300 bg-clip-text text-transparent">
                User Dashboard
              </h1>
              <p className="text-white/70 mt-1">Discover businesses and earn rewards</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-white/70 text-sm">Points</p>
                <p className="text-2xl font-bold text-white">{userPoints}</p>
              </div>
              <div className="text-center">
                <p className="text-white/70 text-sm">Surveys Today</p>
                <p className="text-2xl font-bold text-white">{surveysCompletedToday}/{dailySurveyLimit}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-4 mb-6"
        >
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'discover' ? 'bg-pink-500/50 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <FaChartLine />
              <span>Discover</span>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'favorites' ? 'bg-pink-500/50 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <FaHeart />
              <span>Favorites</span>
            </button>
            <button
              onClick={() => setActiveTab('incentives')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'incentives' ? 'bg-pink-500/50 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <FaGift />
              <span>Incentives</span>
            </button>
            <button
              onClick={() => setActiveTab('transportation')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'transportation' ? 'bg-pink-500/50 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <FaBus />
              <span>Transportation</span>
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <>
              {/* Discover Tab */}
              {activeTab === 'discover' && renderDiscoverTab()}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBusinesses
                    .filter(business => favoriteBusinesses.includes(business.id))
                    .map((business) => (
                      <motion.div
                        key={business.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-white">{business.name}</h3>
                              <p className="text-white/70">{business.location}</p>
                            </div>
                            <button
                              onClick={() => handleToggleFavorite(business.id)}
                              className="text-2xl text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                              <FaStar />
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-white/70">Category</span>
                              <span className="font-medium text-white">{business.category}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-white/70">Rating</span>
                              <span className="font-medium text-white">{business.rating}/5.0</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-white/70">Current Occupancy</span>
                              <div className="flex items-center">
                                <FaUsers className="mr-2 text-blue-400" />
                                <span className="font-medium text-white">{business.currentOccupancy}%</span>
                              </div>
                            </div>
                          </div>

                          {business.hasSurvey && (
                            <button
                              onClick={() => handleSurveyClick(business.id)}
                              className="mt-4 w-full bg-pink-500/50 hover:bg-pink-500/70 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                              <FaPoll />
                              <span>Complete Survey ({business.surveyPoints} points)</span>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}

              {/* Incentives Tab */}
              {activeTab === 'incentives' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedBusiness && (
                    <>
                      <Survey
                        businessId={selectedBusiness.id}
                        businessName={selectedBusiness.name}
                        points={selectedBusiness.surveyPoints || 50}
                        incentives={selectedBusiness.incentives}
                        onComplete={(points) => handleSurveyComplete(selectedBusiness.id, points)}
                      />
                      {renderIncentives()}
                      {renderAchievements()}
                    </>
                  )}
                </div>
              )}

              {/* Transportation Tab */}
              {activeTab === 'transportation' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  {transportationTab}
                </motion.div>
              )}
            </>
          )}
        </motion.div>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6 text-center"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center space-x-2 mb-2">
              <FaHeart className="text-pink-500" />
              <span className="text-white/70">CrowdCast</span>
            </div>
            <p className="text-white/50 text-sm">
              Discover businesses and earn rewards
            </p>
            <div className="flex items-center mt-2 text-white/40 text-xs">
              <FaCopyright className="mr-1" />
              <span>{new Date().getFullYear()} CrowdCast. All rights reserved.</span>
            </div>
          </div>
        </motion.footer>
      </div>

      {/* Survey Modal */}
      {surveyModalOpen && selectedBusinessForSurvey && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-white/10 rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-300 via-pink-400 to-purple-300 bg-clip-text text-transparent">
                  Customer Survey
                </h2>
                <p className="text-white/70 mt-1">
                  Help us improve by providing your feedback
                </p>
              </div>
              <button
                onClick={() => setSurveyModalOpen(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <Survey 
              businessId={selectedBusinessForSurvey} 
              businessName={businesses.find(b => b.id === selectedBusinessForSurvey)?.name}
              points={businesses.find(b => b.id === selectedBusinessForSurvey)?.surveyPoints || 50}
              incentives={businesses.find(b => b.id === selectedBusinessForSurvey)?.incentives}
              onComplete={(points) => handleSurveyComplete(selectedBusinessForSurvey, points)} 
            />
          </div>
        </div>
      )}

      {/* Survey Limit Info */}
      <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-4 z-[100]">
        <div className="flex items-center gap-2">
          <FaPoll className="text-pink-500" />
          <div>
            <p className="text-white text-sm">Surveys completed today</p>
            <p className="text-white/70 text-xs">
              {surveysCompletedToday}/{dailySurveyLimit}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 