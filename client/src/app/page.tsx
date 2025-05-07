'use client';
import ChatToggle from './components/ChatToggle';
import React, { useState, useEffect } from 'react';
type Movie = {
  id: number;
  title: string;
  name?: string;
  release_date?: string;
  overview?: string;
  poster_path?: string;
  progress?: number;
};
import { fetchRecommendations } from './utils/fetchRecommendations';
import { fetchMovieById } from './lib/tmdb';
import {
  Container, Typography, Grid, Card, CardMedia, CardContent, Box,
  TextField, Select, MenuItem, Slider, Rating, InputLabel, FormControl, Button, IconButton,
  CircularProgress, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import Link from 'next/link';
import { supabase } from './services/supabase';
import StarIcon from '@mui/icons-material/Star';
import { useRouter } from 'next/navigation';
import ReactPlayer from 'react-player/youtube';


const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const handleChatbotQuery = async (query: string) => {
  try {
    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    console.log('Chatbot response:', data);
    // You can integrate this response with a chatbot UI component
  } catch (error) {
    console.error('Error querying chatbot:', error);
  }
};

export default function Home() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [trendingIndia, setTrendingIndia] = useState<Movie[]>([]);
  const [trendingUS, setTrendingUS] = useState<Movie[]>([]);
  useEffect(() => {
    const fetchRegionalTrending = async () => {
      try {
        const [indiaRes, usRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}&region=IN`),
          fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}&region=US`)
        ]);
        const indiaData = await indiaRes.json();
        const usData = await usRes.json();
        setTrendingIndia(indiaData.results || []);
        setTrendingUS(usData.results || []);
      } catch (err) {
        console.error("Error fetching regional trending:", err);
      }
    };
    fetchRegionalTrending();
  }, []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bannerTrailer, setBannerTrailer] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState('movie');
  const [continueWatching, setContinueWatching] = useState<Movie[]>([]);
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState<[number, number]>([2000, 2024]);
  const [selectedRating, setSelectedRating] = useState<[number, number]>([0, 10]);
  const [genres, setGenres] = useState<any[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
useEffect(() => {
  const getRecommendations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { recommendations } = await fetchRecommendations(user.id);
      const detailedMovies = await Promise.all(recommendations.map(fetchMovieById));
      setRecommendedMovies(detailedMovies as Movie[]);
    } catch (err) {
      console.error('Failed to load recommendations', err);
    }
  };
  getRecommendations();
}, []);

  // ✅ Fetch Genres for filter dropdown
  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`)
      .then(res => res.json())
      .then(data => setGenres(data.genres || []));
  }, []);
  useEffect(() => {
    const fetchContinueWatching = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id as unknown as string) // ensure user.id is treated as uuid in query
        .gt('progress', 0)
        .lt('progress', 100)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching watch history:', error);
        return;
      }

      const movies = await Promise.all(
        (data ?? []).map(async (item: any) => {
          // Ensure progress is a number between 0 and 100
          if (
            typeof item.progress !== 'number' ||
            item.progress <= 0 ||
            item.progress >= 100
          ) {
            return null;
          }
          try {
            const res = await fetch(
              `https://api.themoviedb.org/3/movie/${item.movie_id}?api_key=${TMDB_API_KEY}`
            );
            const movie = await res.json();
            return { ...movie, progress: item.progress };
          } catch (err) {
            console.error('Error fetching movie details:', err);
            return null;
          }
        })
      );

      setContinueWatching(movies.filter(Boolean) as Movie[]);
    };

    fetchContinueWatching();
  }, []);

  // ✅ Fetch Trending Movies
  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`)
      .then(res => res.json())
      .then(data => setTrending(data.results || []));
  }, []);

  // ✅ Rotate trending trailer
  useEffect(() => {
    if (!trending.length) return;

    const fetchTrailer = async () => {
      const movie = trending[currentIndex];
      if (!movie?.id) return;
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`);
      const data = await res.json();
      const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');      setBannerTrailer(trailer?.key || null);
    };

    fetchTrailer();
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trending.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [currentIndex, trending]);

  // ✅ Auth redirect
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth');
      else setAuthChecked(true);
    });
  }, []);

  // ✅ Handle Search & Filter
  const handleFilter = async () => {
    setLoading(true);
    const genreQ = selectedGenre ? `&with_genres=${selectedGenre}` : '';
    const yearQ = `&primary_release_date.gte=${selectedYear[0]}-01-01&primary_release_date.lte=${selectedYear[1]}-12-31`;
    const ratingQ = `&vote_average.gte=${selectedRating[0]}&vote_average.lte=${selectedRating[1]}`;
    const query = searchQuery ? `&query=${searchQuery}` : '';

    let endpoints: string[] = [];

    if (contentType === 'new') {
      endpoints = [
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&sort_by=release_date.desc${genreQ}${yearQ}${ratingQ}`,
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&sort_by=first_air_date.desc${genreQ}${yearQ}${ratingQ}`
      ];
    } else if (contentType === 'tv') {
      endpoints = [
        searchQuery
          ? `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}${query}`
          : `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}${genreQ}${yearQ}${ratingQ}`
      ];
    } else {
      endpoints = [
        searchQuery
          ? `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}${query}`
          : `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}${genreQ}${yearQ}${ratingQ}`
      ];
    }

    try {
      const allResults = await Promise.all(
        endpoints.map(url => fetch(url).then(res => res.json()))
      );
      const mergedResults = allResults.flatMap((r: any) => r.results || []);
      setMovies(mergedResults as Movie[]);
    } catch (err) {
      console.error('Search failed:', err);
    }
    setLoading(false);
  };

  // ✅ Watchlist logic
  const handleWatchlist = async (user: any, movie: Movie) => {
    const { data: existing } = await supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('movie_id', movie.id)
      .single();

    if (existing) {
      alert('Already in watchlist!');
      return;
    }

    const { error } = await supabase.from('watchlist').insert({
      user_id: user.id,
      movie_id: movie.id,
    });

    if (error) alert('Error adding to watchlist.');
    else alert('Added to watchlist!');
  };
  

  if (!authChecked) return null;

  return (
    <>
      <Container sx={{ mt: 10 }}>
      <Typography variant="h4" align="center" sx={{ color: '#fff', fontFamily: 'Poppins' }}>
        🎬 Movie Recommender
      </Typography>
      <Button variant="contained" onClick={() => handleChatbotQuery('recommend movie')}>
        Ask Chatbot
      </Button>
      {/* Search and Content Type Toggle UI at top */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 4 }}>
        <TextField
          variant="outlined"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ backgroundColor: '#fff', borderRadius: 1, width: 320 }}
        />
        {/* Genre Dropdown */}
        <FormControl variant="outlined" sx={{ minWidth: 140, backgroundColor: '#fff', borderRadius: 1 }}>
          <InputLabel id="genre-label">Genre</InputLabel>
          <Select
            labelId="genre-label"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            label="Genre"
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {genres.map((genre) => (
              <MenuItem key={genre.id} value={genre.id}>{genre.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <ToggleButtonGroup
          value={contentType}
          exclusive
          onChange={(e, val) => val && setContentType(val)}
          sx={{
            bgcolor: 'rgba(255,255,255,0.05)',
            borderRadius: 2,
          }}
        >
          <ToggleButton value="movie" sx={{ color: '#fff', '&.Mui-selected': { color: '#000', bgcolor: '#facc15' } }}>Movies</ToggleButton>
          <ToggleButton value="tv" sx={{ color: '#fff', '&.Mui-selected': { color: '#000', bgcolor: '#facc15' } }}>TV Shows</ToggleButton>
          <ToggleButton value="new" sx={{ color: '#fff', '&.Mui-selected': { color: '#000', bgcolor: '#facc15' } }}>New</ToggleButton>
        </ToggleButtonGroup>
        <Button onClick={handleFilter} variant="contained" sx={{ bgcolor: '#facc15', color: '#000', height: '56px' }}>
          Search
        </Button>
      </Box>
      {continueWatching.length > 0 && (
  <>
    <Typography variant="h5" sx={{ color: '#fff', mt: 4 }}>
      ⏯ Continue Watching
    </Typography>
    <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, py: 2 }}>
      {continueWatching.map((movie: Movie) => (
        <Card
          key={movie.id}
          onClick={() => router.push(`/movie/${movie.id}`)}
          sx={{
            minWidth: 200, maxWidth: 200, height: 340, cursor: 'pointer',
            backgroundColor: 'rgba(255,255,255,0.05)',
            '&:hover': { boxShadow: '0 0 10px #f5c518', transform: 'scale(1.03)' }
          }}
        >
          <CardMedia
            component="img"
            height="300"
            image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          />
          <CardContent>
            <Typography sx={{ color: '#fff' }}>{movie.title}</Typography>
          </CardContent>
          <Box sx={{ height: 5, width: '100%', bgcolor: '#2d2d2d' }}>
            <Box
              sx={{
                width: `${movie.progress || 0}%`,
                height: '100%',
                bgcolor: '#facc15',
                transition: 'width 0.3s ease-in-out'
              }}
            />
          </Box>
        </Card>
      ))}
    </Box>
  </>
)}

      {recommendedMovies.length > 0 && (
        <>
          <Typography variant="h5" sx={{ color: '#fff', mt: 4 }}>
            🎯 Recommended For You
          </Typography>
          <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, py: 2 }}>
            {recommendedMovies.map((movie: Movie) => (
              <Card
                key={movie.id}
                onClick={() => router.push(`/movie/${movie.id}`)}
                sx={{
                  minWidth: 200, maxWidth: 200, height: 340, cursor: 'pointer',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  '&:hover': { boxShadow: '0 0 10px #f5c518', transform: 'scale(1.03)' }
                }}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                />
                <CardContent>
                  <Typography sx={{ color: '#fff' }}>{movie.title}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}

      {/* Content Type Toggle moved to top (Netflix style) */}
      {/* 
      <Box sx={{ mb: 1 }}>
        <ToggleButtonGroup
          value={contentType}
          exclusive
          onChange={(e, val) => val && setContentType(val)}
          sx={{
            bgcolor: 'rgba(255,255,255,0.05)',
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'center',
            px: 1
          }}
        >
          <ToggleButton value="movie" sx={{ color: '#fff', '&.Mui-selected': { color: '#000', bgcolor: '#facc15' } }}>Movie</ToggleButton>
          <ToggleButton value="tv" sx={{ color: '#fff', '&.Mui-selected': { color: '#000', bgcolor: '#facc15' } }}>TV Show</ToggleButton>
          <ToggleButton value="new" sx={{ color: '#fff', '&.Mui-selected': { color: '#000', bgcolor: '#facc15' } }}>New</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      */}

      {/* 🎞 Autoplay Banner */}
      {!searchQuery && !selectedGenre && movies.length === 0 && bannerTrailer && trending[currentIndex] && (
        <Box sx={{ position: 'relative', mb: 4 }}>
          <ReactPlayer
            url={`https://www.youtube.com/watch?v=${bannerTrailer}`}
            playing
            muted
            loop
            width="100%"
            height="500px"
          />
          <Box sx={{
            position: 'absolute', bottom: 20, left: 30,
            color: '#fff', background: 'rgba(0,0,0,0.6)', p: 2, borderRadius: 2,
          }}>
            <Typography variant="h4">{trending[currentIndex].title}</Typography>
            <Typography>{trending[currentIndex].overview}</Typography>
          </Box>
        </Box>
      )}

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {!searchQuery && !selectedGenre && movies.length === 0 && (
        <>
          {/* 🔥 Trending */}
          <Typography variant="h5" sx={{ color: '#fff', mt: 4 }}>🔥 Trending Now</Typography>
          <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, py: 2 }}>
            {trending.map((movie: Movie) => (
              <Card
                key={movie.id}
                onClick={() => router.push(`/movie/${movie.id}`)}
                sx={{
                  minWidth: 200, maxWidth: 200, height: 340, cursor: 'pointer',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  '&:hover': { boxShadow: '0 0 10px #f5c518', transform: 'scale(1.03)' }
                }}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                />
                <CardContent>
                  <Typography sx={{ color: '#fff' }}>{movie.title}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* 🇮🇳 Trending in India */}
          <Typography variant="h5" sx={{ color: '#fff', mt: 4 }}>🇮🇳 Trending in India</Typography>
          <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, py: 2 }}>
            {trendingIndia.map((movie: Movie) => (
              <Card
                key={movie.id}
                onClick={() => router.push(`/movie/${movie.id}`)}
                sx={{
                  minWidth: 200, maxWidth: 200, height: 340, cursor: 'pointer',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  '&:hover': { boxShadow: '0 0 10px #f5c518', transform: 'scale(1.03)' }
                }}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                />
                <CardContent>
                  <Typography sx={{ color: '#fff' }}>{movie.title}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* 🇺🇸 Trending in the US */}
          <Typography variant="h5" sx={{ color: '#fff', mt: 4 }}>🇺🇸 Trending in the US</Typography>
          <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, py: 2 }}>
            {trendingUS.map((movie: Movie) => (
              <Card
                key={movie.id}
                onClick={() => router.push(`/movie/${movie.id}`)}
                sx={{
                  minWidth: 200, maxWidth: 200, height: 340, cursor: 'pointer',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  '&:hover': { boxShadow: '0 0 10px #f5c518', transform: 'scale(1.03)' }
                }}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                />
                <CardContent>
                  <Typography sx={{ color: '#fff' }}>{movie.title}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}

      {movies.length > 0 && (
        <Typography variant="h5" sx={{ color: '#fff', mt: 4 }}>🎯 Search Results</Typography>
      )}
      {/* 🎬 Filtered Movies */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {movies.map((movie: Movie, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Link href={`/movie/${movie.id}`} style={{ textDecoration: 'none' }}>
              <Card
                sx={{
                  height: 420, display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between', cursor: 'pointer',
                  backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.4)',
                  borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'scale(1.05)', boxShadow: '0 0 20px #f5c518' },
                }}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#fff' }}>{movie.title}</Typography>
                  <Typography variant="body2" sx={{ color: '#ccc' }}>{movie.release_date}</Typography>
                  <IconButton
                    onClick={async (e) => {
                      e.preventDefault();
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) handleWatchlist(user, movie);
                      else alert('Please sign in first.');
                    }}
                    sx={{ color: '#fbc02d' }}
                  >
                    <StarIcon />
                  </IconButton>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>

      {/* No Results Fallback */}
      {!loading && movies.length === 0 && (
        <Typography variant="h6" sx={{ color: '#aaa', textAlign: 'center', mt: 4 }}>
          😕 No movies found. Try different filters.
        </Typography>
      )}
    </Container>
    <ChatToggle />
    </>
  );
}
