// init.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Add this import for authentication
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Export auth instance
export const firestore = getFirestore(app);