import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from './hooks/auth'; // Import the useAuth hook
import VideoCall from './pages/VideoCall';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { firestore } from './firebase/init';

export default function App() {
  const { user, loading } = useAuth(); // Use the useAuth hook

  // Create a custom theme (optional)
  const theme = createTheme({
    palette: {
      mode: 'light', // You can change to 'dark' for a dark theme
      primary: {
        main: '#3182ce',
      },
    },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Redirect to home if user is already logged in */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />

          {/* Protect the home route */}
          <Route
            path="/"
            element={user ? <VideoCall db={firestore} user={user} /> : <Navigate to="/login" />}
          />

          {/* Catch-all route */}
          <Route path="*" element={user ? <Navigate to="/" /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}