import { useState, useEffect, useRef, useCallback } from 'react';

type AitriosDetection = {
  class_id: number;
  bbox: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
};

type AitriosData = {
  detections: AitriosDetection[];
};

type Movement = {
  id: string;
  bbox: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  direction: 'in' | 'out' | 'static';
};

type AitriosStats = {
  currentOccupancy: number;
  maxCapacity: number;
  occupancyPercentage: number;
  status: 'normal' | 'warning' | 'critical';
  lastUpdate: string | null;
  history: {
    time: string;
    occupancy: number;
    capacity: number;
  }[];
  movements: Movement[];
};

export const useAitriosData = (deviceId: string, maxCapacity: number = 150) => {
  const [stats, setStats] = useState<AitriosStats>({
    currentOccupancy: 0,
    maxCapacity,
    occupancyPercentage: 0,
    status: 'normal',
    lastUpdate: null,
    history: [],
    movements: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For bounding box direction tracking
  const previousDetectionsRef = useRef<Record<string, { x: number; y: number }>>({});
  
  // Use a ref to track the last update time to prevent too frequent updates
  const lastUpdateTimeRef = useRef<number>(0);
  
  // Use a ref to store the current stats to avoid closure issues
  const currentStatsRef = useRef<AitriosStats>(stats);
  
  // Track if this is the initial load
  const isInitialLoadRef = useRef<boolean>(true);
  
  // Update the ref when stats change
  useEffect(() => {
    currentStatsRef.current = stats;
  }, [stats]);

  // Memoize the fetch function to prevent unnecessary recreations
  const fetchData = useCallback(async () => {
    // Only update if at least 3 seconds have passed since the last update
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 3000) {
      return;
    }
    
    try {
      // Only set loading to true on initial load
      if (isInitialLoadRef.current) {
        setLoading(true);
      }
      
      // In a real implementation, this would be an actual fetch call
      const response = await fetch(
        "https://0myrzet12k.execute-api.us-east-1.amazonaws.com/prod/devices/Aid-80070001-0000-2000-9002-000000000a9c/data?key=202504ut&pj=kyoro"
      );
      const data: AitriosData = await response.json();
      
      // Process detections - only consider class_id 71 (humans)
      const detections = data.detections.filter(d => d.class_id === 71);

      // Calculate bounding box movements for visualization
      const newMovements: Movement[] = [];
      detections.forEach((det, index) => {
        const bbox = det.bbox;
        const currCenterX = (bbox.left + bbox.right) / 2;
        const currCenterY = (bbox.top + bbox.bottom) / 2;
        const id = `person-${index}`; 
        
        let direction: 'in' | 'out' | 'static' = 'static';
        const prev = previousDetectionsRef.current[id];
        if (prev) {
          const dx = currCenterX - prev.x;
          const dy = currCenterY - prev.y;
          // Determine direction based on which axis has bigger movement
          if (Math.abs(dx) > Math.abs(dy)) {
            direction = dx > 0 ? 'in' : 'out';
          } else {
            direction = dy > 0 ? 'in' : 'out';
          }
        }
        newMovements.push({ id, bbox, direction });
        previousDetectionsRef.current[id] = { x: currCenterX, y: currCenterY };
      });

      // Use actual person count from API for more accurate data
      const personCount = detections.length;
      
      // Apply a smoother transition by blending with previous count
      const previousCount = currentStatsRef.current.currentOccupancy;
      const blendFactor = 0.7; // Higher value = more weight to previous count
      const newCount = Math.round(
        (previousCount * blendFactor) + (personCount * (1 - blendFactor))
      );
      
      // Get formatted timestamp with seconds
      const timestamp = new Date();
      const formattedTime = timestamp.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });

      // Calculate occupancy percentage and status
      const occupancyPercentage = Math.round(
        (newCount / maxCapacity) * 100
      );
      
      let status: 'normal' | 'warning' | 'critical' = 'normal';
      if (occupancyPercentage >= 90) status = 'critical';
      else if (occupancyPercentage >= 75) status = 'warning';

      // Update state with new data
      setStats(prevStats => ({
        currentOccupancy: newCount,
        maxCapacity,
        occupancyPercentage,
        status,
        lastUpdate: formattedTime,
        history: [
          ...prevStats.history,
          {
            time: formattedTime,
            occupancy: newCount,
            capacity: maxCapacity
          }
        ].slice(-12), // Keep last 12 data points
        movements: newMovements
      }));
      
      // Update the last update time
      lastUpdateTimeRef.current = now;
      
      setError(null);
    } catch (error) {
      console.error("Error fetching Aitrios data:", error);
      setError("Failed to fetch occupancy data");
    } finally {
      setLoading(false);
      isInitialLoadRef.current = false;
    }
  }, [maxCapacity]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up interval for regular updates - reduced frequency to 5 seconds
    const interval = setInterval(fetchData, 5000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [fetchData]);

  return { stats, loading, error };
}; 