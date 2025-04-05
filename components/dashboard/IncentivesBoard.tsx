"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaTimes, FaGift, FaMedal, FaStar, FaCheck, FaLock } from 'react-icons/fa';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

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

type IncentivesBoardProps = {
  onClose?: () => void;
};

const IncentivesBoard = ({ onClose }: IncentivesBoardProps) => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'achievements' | 'rewards'>('achievements');
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claiming, setClaiming] = useState<string | null>(null);

  // Mock achievements data
  const mockAchievements: Achievement[] = [
    {
      id: 'first-visit',
      title: 'First Visit',
      description: 'Visit your first business',
      icon: <FaMedal className="text-yellow-400" />,
      points: 50,
      completed: false,
    },
    {
      id: 'survey-expert',
      title: 'Survey Expert',
      description: 'Complete 5 surveys',
      icon: <FaStar className="text-yellow-400" />,
      points: 100,
      completed: false,
    },
    {
      id: 'crowd-master',
      title: 'Crowd Master',
      description: 'Visit 10 different businesses',
      icon: <FaTrophy className="text-yellow-400" />,
      points: 200,
      completed: false,
    },
  ];

  // Mock rewards data
  const mockRewards: Reward[] = [
    {
      id: 'discount-10',
      title: '10% Discount',
      description: 'Get 10% off your next visit',
      points: 100,
      icon: <FaGift className="text-pink-400" />,
      claimed: false
    },
    {
      id: 'free-coffee',
      title: 'Free Coffee',
      description: 'Enjoy a free coffee at participating locations',
      points: 150,
      icon: <FaGift className="text-purple-400" />,
      claimed: false
    },
    {
      id: 'vip-access',
      title: 'VIP Access',
      description: 'Skip the line at participating locations',
      points: 300,
      icon: <FaGift className="text-cyan-400" />,
      claimed: false
    }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPoints(userData.points || 0);
          
          // Update achievements
          const userAchievements = userData.completedAchievements || [];
          const achievementDates = userData.achievementDates || {};
          
          const updatedAchievements = mockAchievements.map(achievement => ({
            ...achievement,
            completed: userAchievements.includes(achievement.id),
            completedAt: achievementDates[achievement.id],
          }));
          
          setAchievements(updatedAchievements);
          
          // Update rewards
          const claimedRewards = userData.claimedRewards || [];
          const rewardDates = userData.rewardDates || {};
          
          const updatedRewards = mockRewards.map(reward => ({
            ...reward,
            claimed: claimedRewards.includes(reward.id),
            claimedAt: rewardDates[reward.id],
          }));
          
          setRewards(updatedRewards);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser]);

  const handleClaimReward = async (rewardId: string) => {
    if (!currentUser) return;
    
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || reward.claimed || points < reward.points) return;
    
    try {
      setClaiming(rewardId);
      
      // Update user document
      await updateDoc(doc(db, 'users', currentUser.uid), {
        points: points - reward.points,
        claimedRewards: arrayUnion(rewardId),
        [`rewardDates.${rewardId}`]: new Date().toISOString(),
      });
      
      // Update local state
      setPoints(prev => prev - reward.points);
      setRewards(prev => prev.map(r => 
        r.id === rewardId 
          ? { ...r, claimed: true, claimedAt: new Date().toISOString() }
          : r
      ));
    } catch (error) {
      console.error('Error claiming reward:', error);
    } finally {
      setClaiming(null);
    }
  };

  const getAchievementIcon = (icon: React.ReactNode) => {
    return icon;
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Incentives Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 flex items-center"
      >
        <FaTrophy className="mr-2" />
        View Achievements
      </button>

      {/* Incentives Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/90 border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-300 via-pink-400 to-purple-300 bg-clip-text text-transparent">
                    Rewards & Achievements
                  </h2>
                  <p className="text-white/70 mt-1">
                    Complete achievements and claim rewards with your points
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-3 rounded-lg mr-4">
                    <FaTrophy className="text-pink-400 text-xl" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Your Points</p>
                    <p className="text-2xl font-bold text-white">{points}</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-white/10">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('achievements')}
                    className={`flex-1 px-6 py-4 text-sm font-medium ${
                      activeTab === 'achievements'
                        ? 'text-white border-b-2 border-pink-500'
                        : 'text-white/50 hover:text-white/70'
                    }`}
                  >
                    Achievements
                  </button>
                  <button
                    onClick={() => setActiveTab('rewards')}
                    className={`flex-1 px-6 py-4 text-sm font-medium ${
                      activeTab === 'rewards'
                        ? 'text-white border-b-2 border-pink-500'
                        : 'text-white/50 hover:text-white/70'
                    }`}
                  >
                    Rewards
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeTab === 'achievements' ? (
                      // Achievements List
                      achievements.map(achievement => (
                        <div
                          key={achievement.id}
                          className={`p-4 rounded-lg border ${
                            achievement.completed
                              ? 'bg-green-500/10 border-green-500/20'
                              : 'bg-white/5 border-white/10'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className={`p-3 rounded-lg mr-4 ${
                              achievement.completed
                                ? 'bg-green-500/20'
                                : 'bg-white/10'
                            }`}>
                              {getAchievementIcon(achievement.icon)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-medium text-white">
                                    {achievement.title}
                                  </h3>
                                  <p className="text-white/70 mt-1">
                                    {achievement.description}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-pink-400 font-medium">
                                    +{achievement.points}
                                  </p>
                                  {achievement.completed && achievement.completedAt && (
                                    <p className="text-white/50 text-sm mt-1">
                                      {new Date(achievement.completedAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Rewards List
                      rewards.map(reward => (
                        <div
                          key={reward.id}
                          className={`p-4 rounded-lg border ${
                            reward.claimed
                              ? 'bg-green-500/10 border-green-500/20'
                              : points >= reward.points
                                ? 'bg-white/5 border-white/10'
                                : 'bg-white/5 border-white/10 opacity-50'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className={`p-3 rounded-lg mr-4 ${
                              reward.claimed
                                ? 'bg-green-500/20'
                                : 'bg-white/10'
                            }`}>
                              {getAchievementIcon(reward.icon)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-medium text-white">
                                    {reward.title}
                                  </h3>
                                  <p className="text-white/70 mt-1">
                                    {reward.description}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-pink-400 font-medium">
                                    {reward.points} points
                                  </p>
                                  {reward.claimed ? (
                                    <span className="text-green-400 text-sm">
                                      Claimed
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleClaimReward(reward.id)}
                                      disabled={points < reward.points || claiming === reward.id}
                                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        points < reward.points
                                          ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                          : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90'
                                      }`}
                                    >
                                      {claiming === reward.id ? (
                                        'Claiming...'
                                      ) : points < reward.points ? (
                                        <>
                                          <FaLock className="inline mr-2" />
                                          Not enough points
                                        </>
                                      ) : (
                                        'Claim Reward'
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default IncentivesBoard; 