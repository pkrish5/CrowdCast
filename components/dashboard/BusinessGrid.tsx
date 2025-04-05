"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaStar, 
  FaRegStar, 
  FaUsers, 
  FaMapMarkerAlt, 
  FaPoll,
  FaChevronDown,
  FaChevronUp,
  FaSearch
} from 'react-icons/fa';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Survey from './Survey';

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
  imageUrl?: string;
};

type BusinessGridProps = {
  businesses: Business[];
  onToggleFavorite: (businessId: string) => void;
  onSurveyComplete: (businessId: string, points: number) => void;
  completedSurveys: string[];
  dailySurveyLimit: number;
  surveysCompletedToday: number;
};

const BusinessGrid = ({ 
  businesses, 
  onToggleFavorite, 
  onSurveyComplete,
  completedSurveys,
  dailySurveyLimit,
  surveysCompletedToday
}: BusinessGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    // Filter businesses based on search term
    const filtered = businesses.filter(business => 
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBusinesses(filtered);
  }, [businesses, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const canTakeSurvey = (businessId: string) => {
    return (
      !completedSurveys.includes(businessId) && 
      surveysCompletedToday < dailySurveyLimit
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search businesses..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full px-4 py-2 pl-10 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent"
        />
        <FaSearch className="absolute left-3 top-3 text-white/50" />
      </div>

      {/* Business Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${isExpanded ? '' : 'max-h-[600px] overflow-hidden'}`}>
        {filteredBusinesses.map((business) => (
          <motion.div
            key={business.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-black/30 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
          >
            {/* Business Image */}
            <div className="relative h-40 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
              {business.imageUrl ? (
                <img 
                  src={business.imageUrl} 
                  alt={business.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl text-white/20">{business.name.charAt(0)}</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => onToggleFavorite(business.id)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {business.isFavorite ? (
                    <FaStar className="text-yellow-400 transition-colors duration-200" />
                  ) : (
                    <FaRegStar className="transition-colors duration-200" />
                  )}
                </button>
              </div>
            </div>

            {/* Business Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white">{business.name}</h3>
              <div className="flex items-center text-white/70 text-sm">
                <FaMapMarkerAlt className="mr-1" />
                <span>{business.address}</span>
              </div>
              <div className="flex items-center text-white/70 text-sm">
                <span className="px-2 py-1 bg-white/10 rounded text-xs">{business.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="text-white">{business.rating}</span>
                </div>
                <div className="flex items-center">
                  <FaUsers className="text-blue-400 mr-1" />
                  <span className="text-white">{business.currentOccupancy}%</span>
                </div>
              </div>
            </div>

            {/* Survey Button */}
            <div className="mt-4">
              {business.hasSurvey ? (
                completedSurveys.includes(business.id) ? (
                  <div className="px-4 py-2 bg-white/10 rounded-lg text-white/50 text-center">
                    Survey Completed
                  </div>
                ) : surveysCompletedToday >= dailySurveyLimit ? (
                  <div className="px-4 py-2 bg-white/10 rounded-lg text-white/50 text-center">
                    Daily Limit Reached
                  </div>
                ) : (
                  <Survey 
                    businessId={business.id} 
                    businessName={business.name} 
                    onComplete={(points) => onSurveyComplete(business.id, points)} 
                  />
                )
              ) : (
                <div className="px-4 py-2 bg-white/10 rounded-lg text-white/50 text-center">
                  No Survey Available
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expand/Collapse Button */}
      {filteredBusinesses.length > 6 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={toggleExpand}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
          >
            {isExpanded ? (
              <>
                <FaChevronUp />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <FaChevronDown />
                <span>Show More</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Survey Limit Info */}
      <div className="mt-4 text-center text-white/50 text-sm">
        Surveys completed today: {surveysCompletedToday}/{dailySurveyLimit}
      </div>
    </div>
  );
};

export default BusinessGrid; 