import { supabase } from './supabase';

export async function logInteraction(
  userId: string,
  movieId: number,
  type: 'like' | 'watch' | 'add_watchlist'
) {
  const { error } = await supabase.from('interactions').insert({
    user_id: userId,
    movie_id: movieId,
    type: type,
  });

  if (error) {
    console.error(`❌ Failed to log interaction: ${type}`, error.message);
  } else {
    console.log(`✅ Logged interaction: ${type}`);
  }
}