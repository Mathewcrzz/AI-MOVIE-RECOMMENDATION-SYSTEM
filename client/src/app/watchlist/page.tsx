'use client';
import Link from 'next/link';

import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Container, Typography, Grid, Card, CardMedia, CardContent } from '@mui/material';

export default function WatchlistPage() {
  const [movies, setMovies] = useState<any[]>([]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

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
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        ⭐ Your Watchlist
      </Typography>
      <Grid container spacing={3}>
        {movies.map((movie: any) => (
          <Grid item xs={12} sm={6} md={3} lg={2} key={movie.id}>
            <Link href={`/movie/${movie.id}`} passHref legacyBehavior>
              <a style={{ textDecoration: 'none' }}>
                <Card
                  sx={{
                    width: '100%',
                    height: 350,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 20px #f5c518',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="250"
                    sx={{ objectFit: 'cover' }}
                    image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                  />
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 'bold' }}>{movie.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#ccc' }}>{movie.release_date}</Typography>
                  </CardContent>
                </Card>
              </a>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}