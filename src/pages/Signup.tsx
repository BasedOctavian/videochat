import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/auth';
import {
  Button,
  TextField,
  Container,
  Box,
  Typography,
  Alert,
  Link as MuiLink,
  Stack
} from '@mui/material';

function Signup() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password, displayName);
    } catch (err) {
      setError('Failed to create account. Please try a different email or stronger password.');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Create Account
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              required
              fullWidth
              label="Display Name"
              variant="outlined"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            
            <TextField
              required
              fullWidth
              label="Email Address"
              type="email"
              variant="outlined"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <TextField
              required
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 2 }}
            >
              Sign Up
            </Button>
            
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
              Already have an account?{' '}
              <MuiLink component={Link} to="/login" underline="hover">
                Sign In
              </MuiLink>
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}

export default Signup;