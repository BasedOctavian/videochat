import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VideoCall from './pages/VideoCall';
import { firebaseConfig } from './firebase/config';

// Initialize Firebase once at the top level
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState<any>(null); // Store the current user

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update user state when auth state changes
    });
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  useEffect(() => {
    console.log('User state changed:',auth.currentUser); // Log user state changes
  }, [auth]);

  return (
    <ChakraProvider value={defaultSystem}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/signup" element={<Signup auth={auth} />} />
          <Route path="/login" element={<Login auth={auth} />} />
          {/* Protected route: VideoCall only if user is logged in */}
          <Route
            path="/"
            element={user ? <VideoCall db={db} /> : <Navigate to="/signup" />}
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}