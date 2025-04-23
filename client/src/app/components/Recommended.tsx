'use client';
import { useEffect, useState } from 'react';
import { fetchRecommendations } from '../utils/fetchRecommendations';
import { fetchMovieById } from '../lib/tmdb';
import MovieCard from './MovieCard';

type Movie = {
  id: number;
  title: string;
  poster_path?: string;
  [key: string]: any;
};

const Recommended = ({ userId }: { userId: number }) => {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const getMovies = async () => {
      const { recommended_movie_ids } = await fetchRecommendations(userId);
      const movieData = await Promise.all(recommended_movie_ids.map(fetchMovieById));
      setMovies(movieData);
    };

    getMovies();
  }, [userId]);

  return (
    <section>
      <h2 className="text-2xl font-bold text-white my-4">🎯 Recommended For You</h2>
      <div className="flex overflow-x-scroll">
        {movies.map((movie: Movie) => <MovieCard key={movie.id} movie={movie} />)}
      </div>
    </section>
  );
};

export default Recommended;