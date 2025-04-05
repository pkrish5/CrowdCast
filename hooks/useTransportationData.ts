import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type TransportOption = {
  id: string;
  name: string;
  type: 'bus' | 'subway' | 'walking' | 'bicycle' | 'car';
  duration: string;
  frequency: string;
  stops: number;
  crowdLevel: number;
};

export const useTransportationData = (businessId: string) => {
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransportOptions = async () => {
      if (!businessId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // In a real app, this would fetch from Firestore
        // For now, we'll use mock data
        const mockOptions: TransportOption[] = [
          {
            id: '1',
            name: 'Bus Route 101',
            type: 'bus',
            duration: '15 min',
            frequency: 'Every 10 min',
            stops: 5,
            crowdLevel: 40
          },
          {
            id: '2',
            name: 'Subway Line A',
            type: 'subway',
            duration: '8 min',
            frequency: 'Every 5 min',
            stops: 3,
            crowdLevel: 60
          },
          {
            id: '3',
            name: 'Walking Route',
            type: 'walking',
            duration: '25 min',
            frequency: 'Always available',
            stops: 0,
            crowdLevel: 20
          },
          {
            id: '4',
            name: 'Bicycle Route',
            type: 'bicycle',
            duration: '12 min',
            frequency: 'Always available',
            stops: 0,
            crowdLevel: 30
          },
          {
            id: '5',
            name: 'Car Route',
            type: 'car',
            duration: '10 min',
            frequency: 'Always available',
            stops: 0,
            crowdLevel: 50
          }
        ];
        
        setTransportOptions(mockOptions);
        setError(null);
      } catch (err) {
        console.error('Error fetching transportation options:', err);
        setError('Failed to load transportation options');
      } finally {
        setLoading(false);
      }
    };

    fetchTransportOptions();
  }, [businessId]);

  return { transportOptions, loading, error };
}; 