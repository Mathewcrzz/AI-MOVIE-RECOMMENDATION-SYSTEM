'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Container, Typography, Card, CardMedia, CardContent } from '@mui/material';
import UserInteraction from '../../components/UserInteraction';
import { supabase } from '../../services/supabase';

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [trailer, setTrailer] = useState<string | null>(null);
  const [cast, setCast] = useState<any[]>([]);

  useEffect(() => {
    async function fetchMovieDetails() {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
      const data = await res.json();
      setMovie(data);
    }

    async function fetchTrailer() {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
      const data = await res.json();
      const trailerVideo = data.results.find((vid: any) => vid.type === 'Trailer' && vid.site === 'YouTube');
      if (trailerVideo) setTrailer(trailerVideo.key);
    }

    async function fetchCast() {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
      const data = await res.json();
      setCast(data.cast.slice(0, 10)); // top 10
    }

    if (id) {
      fetchMovieDetails();
      fetchTrailer();
      fetchCast();
    }
    const saveProgress = async (progress: number) => {
      const { data: { user } } = await supabase.auth.getUser();
    
      if (!user) return;
    
      await supabase.from('watch_history').upsert({
        user_id: user.id,
        movie_id: movie.id, // TMDb movie id
        progress,
        updated_at: new Date(),
      });
    };

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [id]);

  if (!movie) return <p>Loading...</p>;

  return (
    <Container sx={{ mt: 4 }}>
      {trailer && (
        <div style={{ marginBottom: '20px' }}>
          <iframe
            width="100%"
            height="500"
            src={`https://www.youtube.com/embed/${trailer}?autoplay=1&mute=1&controls=1`}
            title="Movie Trailer"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      )}

      <Card>
        <CardMedia
          component="img"
          height="500"
          image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
        />
        <CardContent>
          <Typography variant="h4">{movie.title}</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {movie.overview}
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Release Date: {movie.release_date}
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Rating: {movie.vote_average}
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Cast
      </Typography>
      <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem' }}>
        {cast.map((actor) => (
          <Card key={actor.id} sx={{ minWidth: 150, backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <CardMedia
              component="img"
              height="225"
              image={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
              alt={actor.name}
            />
            <CardContent>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{actor.name}</Typography>
              <Typography variant="caption" color="text.secondary">{actor.character}</Typography>
            </CardContent>
          </Card>
        ))}
      </div>

      {userId && id && <UserInteraction movieId={parseInt(id as string)} userId={userId} />}
    </Container>
  );
}