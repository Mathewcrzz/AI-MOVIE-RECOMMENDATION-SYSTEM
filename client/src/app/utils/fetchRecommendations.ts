export async function fetchRecommendations(userId: string, topK: number = 10) {
  const response = await fetch('http://127.0.0.1:8000/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, top_k: topK })
  });

  if (!response.ok) throw new Error('Failed to fetch recommendations');
  return response.json();
}