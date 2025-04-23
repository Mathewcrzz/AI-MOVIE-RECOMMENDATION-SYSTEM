const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export const fetchMovieById = async (id: number) => {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch movie');
  return res.json();
};