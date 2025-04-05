import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaBus, FaSubway, FaWalking, FaBicycle, FaCar } from 'react-icons/fa';
import { useAitriosData } from '@/hooks/useAitriosData';
import { motion, AnimatePresence } from 'framer-motion';

type TransportOption = {
  id: string;
  name: string;
  type: 'bus' | 'subway' | 'walking' | 'bicycle' | 'car';
  duration: string;
  frequency: string;
  stops: number;
  crowdLevel: number;
};

type TransportationSectionProps = {
  transportOptions: TransportOption[];
};

const getCrowdLevelColor = (level: number) => {
  if (level <= 30) return 'text-green-400';
  if (level <= 70) return 'text-yellow-400';
  return 'text-red-400';
};

const getCrowdLevelText = (level: number) => {
  if (level <= 30) return 'Low Crowd';
  if (level <= 70) return 'Moderate Crowd';
  return 'High Crowd';
};

const getTransportIcon = (type: string) => {
  switch (type) {
    case 'bus':
      return <FaBus className="text-xl text-white/70" />;
    case 'subway':
      return <FaSubway className="text-xl text-white/70" />;
    case 'walking':
      return <FaWalking className="text-xl text-white/70" />;
    case 'bicycle':
      return <FaBicycle className="text-xl text-white/70" />;
    case 'car':
      return <FaCar className="text-xl text-white/70" />;
    default:
      return <FaBus className="text-xl text-white/70" />;
  }
};

const TransportationSection: React.FC<TransportationSectionProps> = ({ transportOptions }) => {
  // Get Aitrios data for occupancy-based crowd level adjustments
  const { stats: aitriosStats, loading: aitriosLoading } = useAitriosData('');
  
  // Store the base transport options
  const [baseOptions, setBaseOptions] = useState<TransportOption[]>([]);
  
  // Use a ref to track the last occupancy percentage to prevent unnecessary updates
  const lastOccupancyRef = useRef<number>(0);
  
  // Track if we've initialized the base options
  const initializedRef = useRef<boolean>(false);
  
  // Initialize base options only once
  useEffect(() => {
    if (transportOptions.length > 0 && !initializedRef.current) {
      setBaseOptions(transportOptions);
      lastOccupancyRef.current = aitriosStats.occupancyPercentage;
      initializedRef.current = true;
      
      console.log('TransportationSection initialized with occupancy:', aitriosStats.occupancyPercentage);
    }
  }, [transportOptions, aitriosStats.occupancyPercentage]);
  
  // Calculate adjusted crowd levels based on occupancy
  const adjustedCrowdLevels = useMemo(() => {
    if (baseOptions.length === 0) return {};
    
    // Always recalculate when occupancy changes to ensure real-time updates
    const occupancyFactor = aitriosStats.occupancyPercentage / 100;
    const newCrowdLevels: Record<string, number> = {};
    
    baseOptions.forEach(option => {
      let adjustedCrowdLevel = option.crowdLevel;
      
      if (option.type === 'bus' || option.type === 'subway') {
        // More sensitive to occupancy changes for public transport
        adjustedCrowdLevel = Math.min(100, option.crowdLevel + (occupancyFactor * 30));
      } else {
        // Less sensitive for alternative transport options
        adjustedCrowdLevel = Math.max(0, option.crowdLevel - (occupancyFactor * 15));
      }
      
      newCrowdLevels[option.id] = Math.round(adjustedCrowdLevel);
    });
    
    // Update the last occupancy reference
    lastOccupancyRef.current = aitriosStats.occupancyPercentage;
    
    // Log occupancy changes for debugging
    if (aitriosStats.occupancyPercentage !== lastOccupancyRef.current) {
      console.log('TransportationSection: Occupancy changed to', aitriosStats.occupancyPercentage);
    }
    
    return newCrowdLevels;
  }, [aitriosStats.occupancyPercentage, baseOptions]);
  
  // Sort options by crowd level (ascending) and duration
  const sortedOptions = useMemo(() => {
    return [...baseOptions].sort((a, b) => {
      const aCrowdLevel = adjustedCrowdLevels[a.id] || a.crowdLevel;
      const bCrowdLevel = adjustedCrowdLevels[b.id] || b.crowdLevel;
      
      if (aCrowdLevel === bCrowdLevel) {
        return a.duration.localeCompare(b.duration);
      }
      return aCrowdLevel - bCrowdLevel;
    });
  }, [baseOptions, adjustedCrowdLevels]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Transportation Options</h3>
        <p className="text-white/70">
          Find the best route based on current crowd levels
          {aitriosLoading ? ' (Updating...)' : ` (Last updated: ${aitriosStats.lastUpdate})`}
        </p>
      </div>
      
      <div className="grid gap-4">
        <AnimatePresence mode="wait">
          {sortedOptions.map((option) => {
            const crowdLevel = adjustedCrowdLevels[option.id] || option.crowdLevel;
            
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5">
                      {getTransportIcon(option.type)}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{option.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <span>{option.duration}</span>
                        <span>•</span>
                        <span>{option.frequency}</span>
                        <span>•</span>
                        <span>{option.stops} stops</span>
                      </div>
                    </div>
                  </div>
                  <motion.div 
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getCrowdLevelColor(crowdLevel)}`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.3 }}
                    key={`crowd-${option.id}-${crowdLevel}`}
                  >
                    {getCrowdLevelText(crowdLevel)}
                  </motion.div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        crowdLevel <= 30
                          ? 'bg-green-500'
                          : crowdLevel <= 70
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${crowdLevel}%`,
                        backgroundColor: 
                          crowdLevel <= 30 ? 'rgb(34, 197, 94)' : // green-500
                          crowdLevel <= 70 ? 'rgb(234, 179, 8)' : // yellow-500
                          'rgb(239, 68, 68)' // red-500
                      }}
                      transition={{ 
                        duration: 0.3, 
                        ease: "easeOut",
                        type: "spring",
                        stiffness: 300
                      }}
                      key={`progress-${option.id}-${crowdLevel}`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TransportationSection; 