'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const [movieTitles, setMovieTitles] = useState<Record<number, string>>({});

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setCurrentUser(user);

      const { data: usersData } = await supabase.from('users').select('*');
      const { data: watchlistData } = await supabase.from('watchlist').select('*');

      setUsers(usersData || []);
      setWatchlist(watchlistData || []);
    };

    loadData();
  }, []);

  const deleteEntry = async (userId: string, movieId: number) => {
    await supabase.from('watchlist').delete().match({ user_id: userId, movie_id: movieId });
    setWatchlist(prev => prev.filter(w => !(w.user_id === userId && w.movie_id === movieId)));
  };

  useEffect(() => {
    const fetchMovieTitles = async () => {
      const ids = Array.from(new Set(watchlist.map(w => w.movie_id)));
      const titles: Record<number, string> = {};
      await Promise.all(ids.map(async (id) => {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
        const data = await res.json();
        titles[id] = data.title;
      }));
      setMovieTitles(titles);
    };

    if (watchlist.length > 0) fetchMovieTitles();
  }, [watchlist]);

  const isAdmin = currentUser?.email === 'mathewcrzz@gmail.com'; // change this

  if (!isAdmin) {
    return (
      <Container sx={{ mt: 8 }}>
        <Typography variant="h6" color="error">
          Access denied. You are not an admin.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>Admin Panel</Typography>

      <Box sx={{ my: 4 }}>
        <Typography variant="h6">Users</Typography>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>User ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      <Typography variant="h6">Watchlist Entries</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Movie Title</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {watchlist.map((w) => {
              const user = users.find(u => `${u.id}` === `${w.user_id}`);
              const movieTitle = movieTitles[w.movie_id] || w.movie_id;
              return (
                <TableRow key={`${w.user_id}-${w.movie_id}`}>
                  <TableCell>{user?.email || 'Unknown'}</TableCell>
                  <TableCell>{w.user_id}</TableCell>
                  <TableCell>{movieTitle}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => deleteEntry(w.user_id, w.movie_id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}