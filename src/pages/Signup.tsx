import { useState } from 'react';
import { Box, Heading, Input, Button } from '@chakra-ui/react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    FormErrorIcon,
  } from "@chakra-ui/form-control"

interface SignupProps {
  auth: any; // Firebase auth instance
}

export default function Signup({ auth }: SignupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // On success, auth state changes, and App.tsx redirects to "/"
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={8}>
      <Heading as="h1" size="lg" mb={4}>
        Sign Up
      </Heading>
      <FormControl id="email" mb={4}>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="password" mb={4}>
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormControl>
      {error && <Box color="red.500" mb={4}>{error}</Box>}
      <Button colorScheme="blue" onClick={handleSignup}>
        Sign Up
      </Button>
    </Box>
  );
}