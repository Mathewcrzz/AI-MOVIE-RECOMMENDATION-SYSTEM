'use client';

import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useRouter } from 'next/navigation';
import { Button, Container, Typography, Box } from '@mui/material';

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/');
      }
    });
  }, []);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <Container sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Welcome 👋
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Sign in to discover personalized movie recommendations
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" onClick={handleSignIn}>
          Sign In with Google
        </Button>
      </Box>
    </Container>
  );
}