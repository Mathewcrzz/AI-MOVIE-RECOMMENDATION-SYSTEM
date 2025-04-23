'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [year, setYear] = useState('');

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`)
      .then(res => res.json())
      .then(data => setGenres(data.genres));
  }, []);

  const handleSearch = async () => {
    let url = `https://api.themoviedb.org/3/search/movie?query=${query}&api_key=${TMDB_API_KEY}`;
    if (year) url += `&year=${year}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!genre) {
      setMovies(data.results);
    } else {
      const filtered = data.results.filter(m => m.genre_ids.includes(Number(genre)));
      setMovies(filtered);
    }
  };

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>🎬 Search Movies</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Search by title"
            variant="outlined"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth>
            <InputLabel>Genre</InputLabel>
            <Select
              label="Genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              {genres.map((g: any) => (
                <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            label="Year"
            variant="outlined"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSearch}
            disabled={!query}
          >
            🔍 Search
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {movies.map((movie: any) => (
          <Grid item xs={12} sm={6} md={4} key={movie.id}>
            <Card>
              <CardMedia
                component="img"
                height="300"
                image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
              />
              <CardContent>
                <Typography variant="h6">{movie.title}</Typography>
                <Typography variant="body2">{movie.release_date}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}