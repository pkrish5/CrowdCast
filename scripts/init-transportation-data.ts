import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const sampleTransportData = [
  {
    businessId: 'business1',
    type: 'train',
    name: 'Express Train A',
    duration: '15 mins',
    crowdLevel: 25,
    frequency: 'Every 10 mins',
    stops: 3,
  },
  {
    businessId: 'business1',
    type: 'bus',
    name: 'Bus Route B',
    duration: '25 mins',
    crowdLevel: 45,
    frequency: 'Every 15 mins',
    stops: 5,
  },
  {
    businessId: 'business1',
    type: 'subway',
    name: 'Subway Line C',
    duration: '20 mins',
    crowdLevel: 75,
    frequency: 'Every 5 mins',
    stops: 4,
  },
  {
    businessId: 'business1',
    type: 'walking',
    name: 'Walking Route',
    duration: '30 mins',
    crowdLevel: 10,
    frequency: 'Always available',
    stops: 0,
  },
];

export const initializeTransportationData = async () => {
  try {
    const transportRef = collection(db, 'transportation');
    
    for (const data of sampleTransportData) {
      await addDoc(transportRef, data);
    }
    
    console.log('Transportation data initialized successfully');
  } catch (error) {
    console.error('Error initializing transportation data:', error);
  }
}; 