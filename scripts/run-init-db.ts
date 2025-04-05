import { config } from 'dotenv';
import { resolve } from 'path';
import initializeDatabase from './init-db';

// Load environment variables from .env.local
const result = config({ path: resolve(process.cwd(), '.env.local') });

console.log('Environment variables loaded:', result.parsed ? 'success' : 'failed');
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('Private Key exists:', !!process.env.FIREBASE_PRIVATE_KEY);

const runInit = async () => {
  console.log('Starting database initialization...');
  await initializeDatabase();
  console.log('Database initialization complete!');
  process.exit(0);
};

runInit().catch(error => {
  console.error('Error running initialization:', error);
  process.exit(1);
}); 