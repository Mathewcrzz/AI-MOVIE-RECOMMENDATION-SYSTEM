'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useRouter } from 'next/navigation';
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
} from '@mui/material';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const insertUserIfNew = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existing) {
        const { error } = await supabase.from('users').insert({
          email: user.email,
        });

        if (error) {
            console.error('❌ Supabase INSERT ERROR:', error);
            console.error('🧠 Full error object:', error);
            alert('Supabase error: ' + error.message);
          }else {
          console.log('✅ New user inserted into users table');
        }
      }

      router.push('/');
    };

    insertUserIfNew();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.push('/');
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async () => {
    setError(null);
    let result;

    if (mode === 'signup') {
      result = await supabase.auth.signUp({
        email,
        password,
      });
    } else {
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      router.push('/');
    }
  };

  const handleGoogleAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline',
          hd: '',
        },
      },
    });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        {mode === 'signup' ? 'Sign Up' : 'Log In'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Email"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          variant="filled"
          sx={{ input: { color: '#fff' }, backgroundColor: '#1e1e1e' }}
        />
        <TextField
          label="Password"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          variant="filled"
          sx={{ input: { color: '#fff' }, backgroundColor: '#1e1e1e' }}
        />
        <Button variant="contained" onClick={handleSubmit}>
          {mode === 'signup' ? 'Sign Up' : 'Log In'}
        </Button>
        <Button onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
          {mode === 'signup'
            ? 'Already have an account? Log in'
            : 'New here? Sign up'}
        </Button>
        <Button
          variant="outlined"
          onClick={handleGoogleAuth}
          sx={{
            backgroundColor: '#fff',
            color: '#000',
            borderColor: '#ccc',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            width="20"
            height="20"
          />
          Continue with Google
        </Button>
      </Box>
    </Container>
  );
}