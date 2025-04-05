"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaUser, FaChartBar, FaChartPie, FaUsers, FaClock, FaMoneyBillWave, FaStar, FaComments, FaPoll, FaGift, FaCog, FaHeart, FaCopyright } from 'react-icons/fa';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Survey, { mockQuestions } from './Survey';
import IncentivesBoard from './IncentivesBoard';
import BackgroundAnimation from '@/components/ui/BackgroundAnimation';
import Link from 'next/link';

type BusinessData = {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  category: string;
  openingHours: string;
  capacity: number;
  currentOccupancy: number;
  peakOccupancy: number;
  averageOccupancy: number;
  totalVisitors: number;
  revenue: number;
  surveyResults: Record<string, any>;
  subscriptionTier: 'basic' | 'premium' | 'enterprise';
  surveyLimit: number;
  surveysCreated: number;
  incentives: {
    id: string;
    title: string;
    description: string;
    points: number;
    active: boolean;
  }[];
  aitriosData: {
    deviceId: string;
    lastUpdated: string;
    status: 'active' | 'inactive' | 'maintenance';
    metrics: {
      totalCount: number;
      averageCount: number;
      peakCount: number;
      occupancyRate: number;
      dwellTime: number;
    };
  };
};

type UserData = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  favoriteBusinesses: string[];
  surveyAnswers?: {
    [businessId: string]: {
      answers: Array<{
        questionId: string;
        value: string | number;
      }>;
      completedAt: string;
    };
  };
  points?: number;
};

type SurveyResponse = {
  userId: string;
  answers: Array<{
    questionId: string;
    value: string | number;
  }>;
  completedAt: string;
  incentiveId: string;
};

type SurveyStats = {
  totalResponses: number;
  averageRating: number;
  questionStats: {
    [questionId: string]: {
      average?: number;
      distribution?: {
        [value: string]: number;
      };
    };
  };
};

const BusinessDashboard = () => {
  console.log('BusinessDashboard component rendered with user type:', useAuth().currentUser?.userType);
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'profile' | 'surveys' | 'incentives' | 'users'>('analytics');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [formData, setFormData] = useState<Partial<BusinessData>>({});
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [incentiveModalOpen, setIncentiveModalOpen] = useState(false);
  const [favoritedUsers, setFavoritedUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [surveyStats, setSurveyStats] = useState<SurveyStats>({
    totalResponses: 0,
    averageRating: 0,
    questionStats: {}
  });

  // Mock analytics data
  const mockAnalytics = {
    daily: {
      totalVisitors: 150,
      peakOccupancy: 85,
      averageOccupancy: 45,
      revenue: 2500,
      dwellTime: 45,
      repeatVisitors: 35,
    },
    weekly: {
      totalVisitors: 850,
      peakOccupancy: 90,
      averageOccupancy: 50,
      revenue: 15000,
      dwellTime: 42,
      repeatVisitors: 180,
    },
    monthly: {
      totalVisitors: 3500,
      peakOccupancy: 95,
      averageOccupancy: 55,
      revenue: 60000,
      dwellTime: 40,
      repeatVisitors: 750,
    },
  };

  // Mock occupancy data
  const mockOccupancyData = {
    byDay: [
      { day: 'Mon', occupancy: 45 },
      { day: 'Tue', occupancy: 55 },
      { day: 'Wed', occupancy: 65 },
      { day: 'Thu', occupancy: 75 },
      { day: 'Fri', occupancy: 85 },
      { day: 'Sat', occupancy: 95 },
      { day: 'Sun', occupancy: 80 },
    ],
    byHour: [
      { hour: '9AM', occupancy: 20 },
      { hour: '10AM', occupancy: 30 },
      { hour: '11AM', occupancy: 45 },
      { hour: '12PM', occupancy: 60 },
      { hour: '1PM', occupancy: 75 },
      { hour: '2PM', occupancy: 85 },
      { hour: '3PM', occupancy: 90 },
      { hour: '4PM', occupancy: 85 },
      { hour: '5PM', occupancy: 75 },
      { hour: '6PM', occupancy: 65 },
      { hour: '7PM', occupancy: 55 },
      { hour: '8PM', occupancy: 45 },
    ],
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const businessDoc = await getDoc(doc(db, 'businesses', currentUser.uid));
        
        if (businessDoc.exists()) {
          const data = businessDoc.data() as BusinessData;
          setBusinessData(data);
          setFormData(data);
        }
      } catch (error) {
        console.error('Error fetching business data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinessData();
  }, [currentUser]);

  useEffect(() => {
    const fetchFavoritedUsers = async () => {
      if (!currentUser) return;
      
      try {
        setLoadingUsers(true);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('favoriteBusinesses', 'array-contains', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const users: UserData[] = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data() as UserData;
          users.push({
            uid: doc.id,
            displayName: userData.displayName,
            email: userData.email,
            photoURL: userData.photoURL,
            favoriteBusinesses: userData.favoriteBusinesses || [],
            surveyAnswers: userData.surveyAnswers || {},
            points: userData.points
          });
        });
        
        setFavoritedUsers(users);
      } catch (error) {
        console.error('Error fetching favorited users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    if (activeTab === 'users') {
      fetchFavoritedUsers();
    }
  }, [currentUser, activeTab]);

  useEffect(() => {
    const fetchSurveyResponses = async () => {
      if (!currentUser) return;

      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where(`surveyAnswers.${currentUser.uid}`, '!=', null));
        const querySnapshot = await getDocs(q);
        
        const responses: SurveyResponse[] = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          const surveyData = userData.surveyAnswers?.[currentUser.uid];
          if (surveyData) {
            responses.push({
              userId: doc.id,
              ...surveyData
            });
          }
        });

        setSurveyResponses(responses);

        // Calculate statistics
        const stats: SurveyStats = {
          totalResponses: responses.length,
          averageRating: 0,
          questionStats: {}
        };

        // Calculate average rating and question statistics
        responses.forEach(response => {
          response.answers.forEach(answer => {
            if (!stats.questionStats[answer.questionId]) {
              stats.questionStats[answer.questionId] = {};
            }

            if (typeof answer.value === 'number') {
              // For rating questions
              if (!stats.questionStats[answer.questionId].average) {
                stats.questionStats[answer.questionId].average = 0;
              }
              stats.questionStats[answer.questionId].average! += answer.value;
            } else {
              // For multiple choice questions
              if (!stats.questionStats[answer.questionId].distribution) {
                stats.questionStats[answer.questionId].distribution = {};
              }
              const distribution = stats.questionStats[answer.questionId].distribution!;
              distribution[answer.value] = (distribution[answer.value] || 0) + 1;
            }
          });
        });

        // Calculate averages
        Object.keys(stats.questionStats).forEach(questionId => {
          const question = mockQuestions.find(q => q.id === questionId);
          if (question?.type === 'rating' && stats.questionStats[questionId].average) {
            stats.questionStats[questionId].average! /= responses.length;
          }
        });

        // Calculate overall average rating
        const ratingAnswers = responses.flatMap(r => 
          r.answers.filter(a => mockQuestions.find(q => q.id === a.questionId)?.type === 'rating')
        );
        if (ratingAnswers.length > 0) {
          stats.averageRating = ratingAnswers.reduce((sum, a) => sum + (a.value as number), 0) / ratingAnswers.length;
        }

        setSurveyStats(stats);
      } catch (error) {
        console.error('Error fetching survey responses:', error);
      }
    };

    if (activeTab === 'surveys') {
      fetchSurveyResponses();
    }
  }, [currentUser, activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !businessData) return;
    
    try {
      setLoading(true);
      await updateDoc(doc(db, 'businesses', currentUser.uid), formData);
      setBusinessData(prev => prev ? { ...prev, ...formData } : null);
      setEditing(false);
    } catch (error) {
      console.error('Error updating business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIndicator = (current: number, previous: number) => {
    const diff = current - previous;
    const percentage = (diff / previous) * 100;
    
    if (percentage > 0) {
      return <span className="text-green-400">↑ {percentage.toFixed(1)}%</span>;
    } else if (percentage < 0) {
      return <span className="text-red-400">↓ {Math.abs(percentage).toFixed(1)}%</span>;
    }
    return <span className="text-white/50">→ 0%</span>;
  };

  const getOccupancyStatusColor = (occupancy: number) => {
    if (occupancy >= 80) return 'text-red-400';
    if (occupancy >= 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (!businessData) return null;

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
                {businessData.name}
              </h1>
              <p className="text-white/70 mt-1">{businessData.description}</p>
            </div>
            <div className="flex space-x-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSurveyModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500/50 hover:bg-pink-500/70 rounded-lg text-white font-medium transition-colors"
              >
                <FaPoll />
                Create Survey
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIncentiveModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/50 hover:bg-blue-500/70 rounded-lg text-white font-medium transition-colors"
              >
                <FaGift />
                Manage Incentives
              </motion.button>
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
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'analytics' ? 'bg-pink-500/50 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <FaChartLine />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('surveys')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'surveys' ? 'bg-pink-500/50 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <FaPoll />
              <span>Surveys</span>
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
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'profile' ? 'bg-pink-500/50 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <FaUser />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'users' ? 'bg-pink-500/50 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <FaUsers />
              <span>Users</span>
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
              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-8">
                  {/* Aitrios Device Status */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white">Aitrios Device Status</h2>
                        <p className="text-white/70 mt-1">
                          Real-time occupancy tracking device
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        businessData.aitriosData.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : businessData.aitriosData.status === 'maintenance'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {businessData.aitriosData.status.charAt(0).toUpperCase() + businessData.aitriosData.status.slice(1)}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/70">Device ID</span>
                          <FaChartBar className="text-pink-400" />
                        </div>
                        <p className="text-white font-medium">{businessData.aitriosData.deviceId}</p>
                      </div>
                      <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/70">Last Updated</span>
                          <FaClock className="text-pink-400" />
                        </div>
                        <p className="text-white font-medium">
                          {new Date(businessData.aitriosData.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/70">Current Count</span>
                          <FaUsers className="text-pink-400" />
                        </div>
                        <p className="text-white font-medium">{businessData.aitriosData.metrics.totalCount}</p>
                      </div>
                      <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/70">Dwell Time</span>
                          <FaClock className="text-pink-400" />
                        </div>
                        <p className="text-white font-medium">{businessData.aitriosData.metrics.dwellTime} min</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-white/70">Total Visitors</p>
                          <h3 className="text-2xl font-bold text-white mt-1">
                            {mockAnalytics.daily.totalVisitors}
                          </h3>
                        </div>
                        <div className="bg-pink-500/20 p-3 rounded-lg">
                          <FaUsers className="text-pink-400 text-xl" />
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-white/50">vs. yesterday</span>
                        <span className="ml-2 text-green-400">↑ 12.5%</span>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-white/70">Peak Occupancy</p>
                          <h3 className="text-2xl font-bold text-white mt-1">
                            {mockAnalytics.daily.peakOccupancy}%
                          </h3>
                        </div>
                        <div className="bg-purple-500/20 p-3 rounded-lg">
                          <FaChartBar className="text-purple-400 text-xl" />
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-white/50">vs. yesterday</span>
                        <span className="ml-2 text-red-400">↓ 5.2%</span>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-white/70">Average Occupancy</p>
                          <h3 className="text-2xl font-bold text-white mt-1">
                            {mockAnalytics.daily.averageOccupancy}%
                          </h3>
                        </div>
                        <div className="bg-blue-500/20 p-3 rounded-lg">
                          <FaChartPie className="text-blue-400 text-xl" />
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-white/50">vs. yesterday</span>
                        <span className="ml-2 text-green-400">↑ 3.8%</span>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-white/70">Revenue</p>
                          <h3 className="text-2xl font-bold text-white mt-1">
                            ${mockAnalytics.daily.revenue}
                          </h3>
                        </div>
                        <div className="bg-green-500/20 p-3 rounded-lg">
                          <FaMoneyBillWave className="text-green-400 text-xl" />
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-white/50">vs. yesterday</span>
                        <span className="ml-2 text-green-400">↑ 8.3%</span>
                      </div>
                    </div>
                  </div>

                  {/* Survey Results */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-white">Survey Results</h2>
                        <p className="text-white/70 mt-1">
                          Customer feedback and satisfaction metrics
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-3 rounded-lg">
                        <FaComments className="text-pink-400 text-xl" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(businessData.surveyResults || {}).map(([surveyId, results]) => (
                        <div key={surveyId} className="bg-black/30 border border-white/10 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-white">Customer Experience</h3>
                            <div className="flex items-center">
                              <FaStar className="text-yellow-400 mr-1" />
                              <span className="text-white font-medium">
                                {(results.q1 + results.q2 + results.q3) / 3}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/70">Overall Experience</span>
                              <span className="text-white">{results.q1}/5</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/70">Service Satisfaction</span>
                              <span className="text-white">{results.q2}/5</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/70">Likelihood to Return</span>
                              <span className="text-white">{results.q3}/5</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-white/70 text-sm mb-2">Recent Feedback</p>
                            <p className="text-white text-sm italic">"{results.q4}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Occupancy Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Daily Occupancy */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Occupancy by Day</h3>
                      <div className="h-64 flex items-end space-x-2">
                        {mockOccupancyData.byDay.map((day, index) => (
                          <div key={day.day} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-gradient-to-t from-pink-500 to-purple-500 rounded-t-lg"
                              style={{ height: `${day.occupancy}%` }}
                            ></div>
                            <span className="text-white/50 text-xs mt-2">{day.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hourly Occupancy */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Occupancy by Hour</h3>
                      <div className="h-64 flex items-end space-x-2">
                        {mockOccupancyData.byHour.map((hour, index) => (
                          <div key={hour.hour} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-gradient-to-t from-pink-500 to-purple-500 rounded-t-lg"
                              style={{ height: `${hour.occupancy}%` }}
                            ></div>
                            <span className="text-white/50 text-xs mt-2">{hour.hour}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Surveys Tab */}
              {activeTab === 'surveys' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-white">Survey Responses</h2>
                        <p className="text-white/70 mt-1">
                          View and analyze customer feedback
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-white/70 text-sm">Total Responses</p>
                          <p className="text-2xl font-bold text-white">{surveyStats.totalResponses}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white/70 text-sm">Average Rating</p>
                          <div className="flex items-center">
                            <FaStar className="text-yellow-400 mr-1" />
                            <span className="text-2xl font-bold text-white">
                              {surveyStats.averageRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {mockQuestions.map(question => {
                        const stats = surveyStats.questionStats[question.id];
                        if (!stats) return null;

                        return (
                          <div key={question.id} className="bg-black/30 border border-white/10 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-white mb-4">{question.text}</h3>
                            
                            {question.type === 'rating' && stats.average !== undefined && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <FaStar className="text-yellow-400 mr-1" />
                                    <span className="text-white">{stats.average.toFixed(1)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <FaStar
                                        key={i}
                                        className={`mr-1 ${
                                          i < Math.round(stats.average!)
                                            ? 'text-yellow-400'
                                            : 'text-white/20'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                                    style={{ width: `${(stats.average / 5) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {question.type === 'multiple-choice' && stats.distribution && (
                              <div className="space-y-3">
                                {Object.entries(stats.distribution).map(([value, count]) => {
                                  const percentage = (count / surveyStats.totalResponses) * 100;
                                  return (
                                    <div key={value} className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-white/70">{value}</span>
                                        <span className="text-white">{count} responses</span>
                                      </div>
                                      <div className="w-full bg-white/10 rounded-full h-2">
                                        <div
                                          className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {question.type === 'text' && (
                              <div className="space-y-3">
                                {surveyResponses
                                  .filter(r => r.answers.some(a => a.questionId === question.id))
                                  .map((response, index) => (
                                    <div key={index} className="bg-white/5 rounded-lg p-3">
                                      <p className="text-white">
                                        {response.answers.find(a => a.questionId === question.id)?.value}
                                      </p>
                                      <p className="text-white/50 text-sm mt-1">
                                        {new Date(response.completedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Incentives Tab */}
              {activeTab === 'incentives' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-white">Incentive Management</h2>
                        <p className="text-white/70 mt-1">
                          Create and manage customer incentives
                        </p>
                      </div>
                      <button 
                        onClick={() => setIncentiveModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                      >
                        <FaGift />
                        Create New Incentive
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {businessData.incentives && businessData.incentives.length > 0 ? (
                        businessData.incentives.map(incentive => (
                          <div key={incentive.id} className="bg-black/30 border border-white/10 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-medium text-white">{incentive.title}</h3>
                                <p className="text-white/70 text-sm mt-1">{incentive.description}</p>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs ${
                                incentive.active 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {incentive.active ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <FaGift className="text-cyan-400 mr-1" />
                                <span className="text-white">{incentive.points} points</span>
                              </div>
                              <button className="text-white/70 hover:text-white transition-colors">
                                <FaCog />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-6 text-white/50">
                          <FaGift className="mx-auto text-3xl mb-2" />
                          <p>No incentives created yet</p>
                          <button 
                            onClick={() => setIncentiveModalOpen(true)}
                            className="mt-3 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                          >
                            Create Your First Incentive
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-white">Favorited Users</h2>
                        <p className="text-white/70 mt-1">
                          Users who have added your business to their favorites
                        </p>
                      </div>
                    </div>
                    
                    {loadingUsers ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                      </div>
                    ) : favoritedUsers.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {favoritedUsers.map((user) => (
                          <div key={user.uid} className="bg-black/30 border border-white/10 rounded-lg p-6">
                            <div className="flex items-center space-x-4 mb-6">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {user.displayName?.[0] || user.email?.[0] || '?'}
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-white">
                                  {user.displayName || 'Anonymous User'}
                                </h3>
                                <p className="text-white/70 text-sm">
                                  {user.email}
                                </p>
                                {user.points && (
                                  <div className="flex items-center mt-1 text-sm">
                                    <FaStar className="text-yellow-400 mr-1" />
                                    <span className="text-white/70">{user.points} points</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {user.surveyAnswers?.[currentUser?.uid || ''] ? (
                              <div className="mt-4 space-y-4">
                                <h4 className="text-white font-medium">Survey Responses</h4>
                                <div className="grid gap-4">
                                  {user.surveyAnswers[currentUser?.uid || ''].answers.map((answer, index) => {
                                    const question = mockQuestions.find((q: { id: string }) => q.id === answer.questionId);
                                    if (!question) return null;

                                    return (
                                      <div key={index} className="bg-white/5 rounded-lg p-4">
                                        <p className="text-white/70 text-sm mb-2">{question.text}</p>
                                        <div className="flex items-center">
                                          {question.type === 'rating' ? (
                                            <div className="flex items-center">
                                              {Array.from({ length: 5 }).map((_, i) => (
                                                <FaStar
                                                  key={i}
                                                  className={`mr-1 ${
                                                    i < (answer.value as number)
                                                      ? 'text-yellow-400'
                                                      : 'text-white/20'
                                                  }`}
                                                />
                                              ))}
                                            </div>
                                          ) : (
                                            <p className="text-white">{answer.value}</p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <div className="text-white/50 text-sm">
                                    Completed on: {new Date(user.surveyAnswers[currentUser?.uid || ''].completedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-white/50">
                                <p>No survey responses yet</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FaUsers className="mx-auto text-4xl text-white/30 mb-4" />
                        <p className="text-white/50">No users have favorited your business yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-2xl"
                >
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-white">Business Profile</h2>
                        <p className="text-white/70 mt-1">
                          Manage your business information
                        </p>
                      </div>
                      <button
                        onClick={() => setEditing(!editing)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20"
                      >
                        {editing ? 'Cancel' : 'Edit Profile'}
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Business Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Description</label>
                        <textarea
                          name="description"
                          value={formData.description || ''}
                          onChange={handleInputChange}
                          disabled={!editing}
                          rows={3}
                          className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent disabled:opacity-50"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/70 text-sm mb-1">Address</label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-1">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent disabled:opacity-50"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/70 text-sm mb-1">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-1">Website</label>
                          <input
                            type="url"
                            name="website"
                            value={formData.website || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent disabled:opacity-50"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/70 text-sm mb-1">Category</label>
                          <input
                            type="text"
                            name="category"
                            value={formData.category || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-1">Opening Hours</label>
                          <input
                            type="text"
                            name="openingHours"
                            value={formData.openingHours || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent disabled:opacity-50"
                          />
                        </div>
                      </div>
                      {editing && (
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90"
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
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
              Manage your business and engage with customers
            </p>
            <div className="flex items-center mt-2 text-white/40 text-xs">
              <FaCopyright className="mr-1" />
              <span>{new Date().getFullYear()} CrowdCast. All rights reserved.</span>
            </div>
          </div>
        </motion.footer>
      </div>

      {/* Survey Modal */}
      {surveyModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <Survey 
              businessId={currentUser?.uid || ''} 
              businessName={businessData?.name || ''} 
              onComplete={() => setSurveyModalOpen(false)} 
            />
          </motion.div>
        </div>
      )}

      {/* Incentive Modal */}
      {incentiveModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <IncentivesBoard onClose={() => setIncentiveModalOpen(false)} />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BusinessDashboard; 