'use client';

import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import { Button } from '@mui/material';

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return user ? (
    <Button onClick={handleSignOut} variant="contained" color="secondary">
      Sign Out
    </Button>
  ) : (
    <Button onClick={handleSignIn} variant="contained" color="primary">
      Sign In with Google
    </Button>
  );
}