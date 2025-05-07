import { supabase } from "../services/supabase";

export const saveWatchProgress = async (user_id: string, movie_id: number, progress: number) => {
  await supabase.from("watch_history").upsert({
    user_id,
    movie_id,
    progress
  });
};