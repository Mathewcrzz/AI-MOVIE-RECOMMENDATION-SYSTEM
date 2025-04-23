'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Box, Typography, Rating, TextField, Button, Card, CardContent } from '@mui/material';

const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

interface Props {
  movieId: number;
  userId: string;
}

export default function UserInteraction({ movieId, userId }: Props) {
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  if (!movieId || !userId) return null;

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('user_feedback')
        .select('*')
        .eq('user_id', userId)
        .eq('movie_id', movieId)
        .single();
      if (data) {
        setRating(data.rating);
        setReview(data.review);
        setSubmitted(true);
      }
    };
    fetchData();
  }, [movieId, userId]);

  const handleSubmit = async () => {
    if (!rating) return;
 
    const { error: ratingError } = await supabase.from('ratings').upsert({
      user_id: userId,
      movie_id: movieId,
      rating,
      created_at: new Date().toISOString(),
    });
 
    let reviewError = null;
    if (review.trim()) {
      const response = await supabase.from('reviews').upsert({
        user_id: userId,
        movie_id: movieId,
        review,
        created_at: new Date().toISOString(),
      });
      reviewError = response.error;
    }
 
    if (!ratingError && !reviewError) {
      setSubmitted(true);
      await supabase.from('interactions').insert({
        user_id: userId,
        movie_id: movieId,
        type: 'rated',
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <Card sx={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Rate & Review
        </Typography>
        <Rating
          name="movie-rating"
          value={rating}
          onChange={(_, value) => setRating(value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Write a review (optional)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          sx={{ backgroundColor: '#f5c518', color: '#000', fontWeight: 'bold' }}
          onClick={handleSubmit}
          disabled={false}
        >
          {submitted ? 'Submitted' : 'Submit Feedback'}
        </Button>
      </CardContent>
    </Card>
  );
}