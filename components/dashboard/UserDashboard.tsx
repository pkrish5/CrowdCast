"use client";

import React, { useState, useEffect } from 'react';
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
  FaCopyright
} from 'react-icons/fa';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Survey from './Survey';
import BackgroundAnimation from '@/components/ui/BackgroundAnimation';
import Link from 'next/link';
import BusinessGrid from './BusinessGrid';

type Business = {
  id: string;
  name: string;
  address: string;
  category: string;
  rating: number;
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

const UserDashboard = () => {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [favoriteBusinesses, setFavoriteBusinesses] = useState<string[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [occupancyHistory, setOccupancyHistory] = useState<OccupancyHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'favorites' | 'incentives'>('discover');
  const [userPoints, setUserPoints] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [selectedBusinessForSurvey, setSelectedBusinessForSurvey] = useState<string | null>(null);
  const [completedSurveys, setCompletedSurveys] = useState<string[]>([]);
  const [surveysCompletedToday, setSurveysCompletedToday] = useState(0);
  const [lastSurveyDate, setLastSurveyDate] = useState<string | null>(null);
  const dailySurveyLimit = 3;

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

  // Fetch businesses from Firestore
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const businessesRef = collection(db, 'users');
        const q = query(businessesRef, where('userType', '==', 'business'));
        const querySnapshot = await getDocs(q);
        
        const fetchedBusinesses: Business[] = [];
        querySnapshot.forEach((doc) => {
          const businessData = doc.data();
          fetchedBusinesses.push({
            id: doc.id,
            name: businessData.businessName || businessData.displayName || 'Unnamed Business',
            address: businessData.address || 'No address provided',
            category: businessData.category || 'Uncategorized',
            rating: businessData.rating || 0,
            currentOccupancy: businessData.currentOccupancy || 0,
            maxCapacity: businessData.maxCapacity || 100,
            isFavorite: favoriteBusinesses.includes(doc.id),
            hasSurvey: businessData.hasSurvey || false,
            surveyPoints: businessData.surveyPoints || 50,
            incentives: businessData.incentives || []
          });
        });
        
        setBusinesses(fetchedBusinesses);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinesses();
  }, [favoriteBusinesses]);

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
    if (surveysCompletedToday >= dailySurveyLimit) {
      alert('You have reached your daily survey limit. Please try again tomorrow.');
      return;
    }
    setSelectedBusinessForSurvey(businessId);
    setSurveyModalOpen(true);
  };

  const handleClaimReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward && userPoints >= reward.points) {
      setUserPoints(prev => prev - reward.points);
      setRewards(prev => 
        prev.map(r => 
          r.id === rewardId ? { ...r, claimed: true } : r
        )
      );
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Render the discover tab content
  const renderDiscoverTab = () => (
    <div className="space-y-6">
      <BusinessGrid 
        businesses={businesses}
        onToggleFavorite={handleToggleFavorite}
        onSurveyComplete={handleSurveyComplete}
        completedSurveys={completedSurveys}
        dailySurveyLimit={dailySurveyLimit}
        surveysCompletedToday={surveysCompletedToday}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white relative overflow-hidden">
      <BackgroundAnimation />
      
      {/* Navigation */}
      <nav className="bg-black/50 backdrop-blur-sm border-b border-white/10 relative z-20">
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
      
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="relative z-10 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-300 via-pink-400 to-purple-300 bg-clip-text text-transparent">
                Welcome, {currentUser?.displayName || 'User'}
              </h1>
              <p className="text-white/70 mt-1">
                Discover and interact with local businesses
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-400" />
                  <div>
                    <p className="text-white text-sm">Available Points</p>
                    <p className="text-white/70 text-xl font-bold">{userPoints}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
              <FaMapMarkerAlt />
              <span>Discover</span>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'favorites' ? 'bg-pink-500/50 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <FaStar />
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
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative mb-6"
        >
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search businesses..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50 transition-colors"
            />
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {activeTab === 'discover' && renderDiscoverTab()}

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
                          <p className="text-white/70">{business.address}</p>
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

          {activeTab === 'incentives' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Achievements Section */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Achievements</h2>
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        achievement.completed ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        {achievement.icon}
                        <div>
                          <h3 className="font-semibold text-white">{achievement.title}</h3>
                          <p className="text-sm text-white/70">{achievement.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-400">+{achievement.points} points</div>
                        {achievement.completed && (
                          <div className="text-sm text-green-400">Completed {achievement.completedAt}</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Rewards Section */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Available Rewards</h2>
                <div className="space-y-4">
                  {rewards.map((reward) => (
                    <motion.div
                      key={reward.id}
                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        reward.claimed ? 'bg-white/5 border border-white/10 opacity-50' : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        {reward.icon}
                        <div>
                          <h3 className="font-semibold text-white">{reward.title}</h3>
                          <p className="text-sm text-white/70">{reward.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-400">{reward.points} points</div>
                        {!reward.claimed && userPoints >= reward.points && (
                          <button
                            onClick={() => handleClaimReward(reward.id)}
                            className="mt-2 bg-pink-500/50 hover:bg-pink-500/70 text-white py-1 px-3 rounded-lg transition-colors text-sm"
                          >
                            Claim
                          </button>
                        )}
                        {reward.claimed && (
                          <div className="text-sm text-green-400">Claimed</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
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
              Discover local businesses and earn rewards
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