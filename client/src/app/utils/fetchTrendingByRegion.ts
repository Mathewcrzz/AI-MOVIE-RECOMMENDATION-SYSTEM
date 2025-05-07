
export async function fetchTrendingByRegion(regionCode: string) {
  const response = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&region=${regionCode}`);
  const data = await response.json();
  return data.results || [];
}