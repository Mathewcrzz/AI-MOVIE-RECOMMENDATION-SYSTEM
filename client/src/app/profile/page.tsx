'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function WatchlistPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const [editOpen, setEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState('Your Profile');
  const [avatarLetter, setAvatarLetter] = useState('U');

  useEffect(() => {
    const fetchWatchlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email ?? null);

      const { data: watchlist } = await supabase
        .from('watchlist')
        .select('movie_id')
        .eq('user_id', user.id);

      if (!watchlist) return;

      const results = await Promise.all(
        watchlist.map(async ({ movie_id }) => {
          const res = await fetch(`https://api.themoviedb.org/3/movie/${movie_id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
          return res.ok ? await res.json() : null;
        })
      );

      setMovies(results.filter(Boolean));
    };

    fetchWatchlist();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 8, color: '#fff' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #1f1f1f, #2c2c2c)',
          p: 3,
          borderRadius: 4,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}
      >
        <Avatar
          alt="User"
          sx={{ width: 80, height: 80, fontSize: 32, bgcolor: '#f50057', cursor: 'pointer' }}
          onClick={() => setEditOpen(true)}
        >
          {avatarLetter}
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {displayName}
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.7 }}>
            Account settings and preferences
          </Typography>
        </Box>
      </Box>
  
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" gutterBottom>
          🎞 Your Watchlist
        </Typography>
        {movies.length === 0 ? (
          <Typography variant="body1">Your watchlist is empty.</Typography>
        ) : (
          <Grid container spacing={3}>
            {movies.map((movie) => (
              <Grid item xs={6} sm={3} md={2} key={movie.id} component="div">
                <Card
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 3,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="150"
                    image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="caption" noWrap sx={{ color: '#fff' }}>
                      {movie.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          background: 'linear-gradient(135deg, #2a2a2a, #1e1e1e)',
          p: 4,
          borderRadius: 4,
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
          mt: 6
        }}
      >
        <Typography variant="h5" gutterBottom>
          👤 Account Info
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
          <Box>
            <Typography variant="body1">Email: {userEmail || 'Loading...'}</Typography>
            <Typography variant="body1">Plan: Premium Ultra HD</Typography>
            <Typography variant="body1">Member since: March 2024</Typography>
          </Box>
          <Box>
          <Button
  variant="text"
  color="primary"
  sx={{ textTransform: 'none', mb: 1 }}
  onClick={() => setEditOpen(true)}
>
  Edit Profile
</Button>

<Button
  variant="text"
  color="primary"
  sx={{ textTransform: 'none' }}
  onClick={() => alert('Manage Devices Model coming soon!')}
>
  Manage Devices
</Button>
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>📺 Watch History</Typography>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            This section will display your recently watched titles.
          </Typography>
        </Box>
      </Box>
      
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Display Name"
            type="text"
            fullWidth
            variant="outlined"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Avatar Letter"
            type="text"
            fullWidth
            variant="outlined"
            value={avatarLetter}
            onChange={(e) => setAvatarLetter(e.target.value)}
            inputProps={{ maxLength: 1 }}
          />
        </DialogContent>
        <DialogActions>
        <Button
  onClick={async () => {
    setEditOpen(false);
    const name = displayName.trim();
    const letter = avatarLetter.trim().slice(0, 1).toUpperCase();
    setDisplayName(name);
    setAvatarLetter(letter);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        display_name: name,
        avatar_letter: letter,
      });
  }}
  color="primary"
  variant="contained"
>
  Save
</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}