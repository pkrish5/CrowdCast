import { adminDb } from '../lib/firebase-admin';

const initializeDatabase = async () => {
  try {
    // Create businesses collection
    const businessesCollection = adminDb.collection('businesses');
    
    // Add mock businesses
    const mockBusinesses = [
      {
        id: '1',
        name: 'Coffee Shop',
        address: '123 Main St',
        category: 'Cafe',
        rating: 4.5,
        currentOccupancy: 65,
        maxCapacity: 100,
        hasSurvey: true,
        surveyPoints: 50,
        description: 'A cozy coffee shop with great ambiance',
        openingHours: '7:00 AM - 8:00 PM',
        phone: '(555) 123-4567',
        email: 'coffee@example.com',
        website: 'www.coffeeshop.com'
      },
      {
        id: '2',
        name: 'Gym',
        address: '456 Fitness Ave',
        category: 'Fitness',
        rating: 4.2,
        currentOccupancy: 80,
        maxCapacity: 150,
        hasSurvey: false,
        surveyPoints: 0,
        description: 'State-of-the-art fitness center',
        openingHours: '5:00 AM - 11:00 PM',
        phone: '(555) 234-5678',
        email: 'gym@example.com',
        website: 'www.gym.com'
      },
      {
        id: '3',
        name: 'Restaurant',
        address: '789 Food Blvd',
        category: 'Dining',
        rating: 4.7,
        currentOccupancy: 45,
        maxCapacity: 120,
        hasSurvey: true,
        surveyPoints: 75,
        description: 'Fine dining experience',
        openingHours: '11:00 AM - 10:00 PM',
        phone: '(555) 345-6789',
        email: 'restaurant@example.com',
        website: 'www.restaurant.com'
      }
    ];

    for (const business of mockBusinesses) {
      await businessesCollection.doc(business.id).set(business);
    }

    // Create achievements collection
    const achievementsCollection = adminDb.collection('achievements');
    
    const mockAchievements = [
      {
        id: 'first-visit',
        title: 'First Visit',
        description: 'Visit your first business',
        points: 50
      },
      {
        id: 'survey-expert',
        title: 'Survey Expert',
        description: 'Complete 5 surveys',
        points: 100
      },
      {
        id: 'frequent-visitor',
        title: 'Frequent Visitor',
        description: 'Visit 10 different businesses',
        points: 150
      },
      {
        id: 'points-collector',
        title: 'Points Collector',
        description: 'Earn 500 points total',
        points: 200
      }
    ];

    for (const achievement of mockAchievements) {
      await achievementsCollection.doc(achievement.id).set(achievement);
    }

    // Create rewards collection
    const rewardsCollection = adminDb.collection('rewards');
    
    const mockRewards = [
      {
        id: 'coffee',
        title: 'Free Coffee',
        description: 'Redeem for a free coffee at any participating cafe',
        points: 100
      },
      {
        id: 'discount',
        title: '10% Discount',
        description: 'Get 10% off your next purchase at any participating business',
        points: 200
      },
      {
        id: 'meal',
        title: 'Free Meal',
        description: 'Redeem for a free meal at any participating restaurant',
        points: 300
      }
    ];

    for (const reward of mockRewards) {
      await rewardsCollection.doc(reward.id).set(reward);
    }

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export default initializeDatabase; 