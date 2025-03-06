import { auth, firestore } from './../firebase/init';
import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Define the shape of a user in Firestore
interface FirestoreUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: Date;
}

// Custom hook for Firebase authentication and Firestore operations
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign up a new user and create a Firestore document for them
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create a Firestore document for the new user
      const userDoc = doc(firestore, 'users', user.uid);
      await setDoc(userDoc, {
        uid: user.uid,
        email: user.email,
        displayName: displayName || '',
        photoURL: user.photoURL || '',
        createdAt: new Date(),
      });

      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // Sign in an existing user
  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Sign out the current user
  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Fetch the current user's Firestore data
  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = doc(firestore, 'users', uid);
      const docSnapshot = await getDoc(userDoc);
      if (docSnapshot.exists()) {
        return docSnapshot.data() as FirestoreUser;
      } else {
        console.error('User document not found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch additional user data from Firestore
        const userData = await fetchUserData(user.uid);
        setUser({ ...user, ...userData });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    signUp,
    signIn,
    logOut,
  };
};