// src/app/services/tmdb.ts

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchPopularMovies() {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
  if (!res.ok) throw new Error("Failed to fetch movies");
  const data = await res.json();
  return data.results;
}