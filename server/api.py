from fastapi import FastAPI
from inference import recommend_movies

app = FastAPI()

@app.get("/recommendations/{user_id}")
def get_recommendations(user_id: int, top_n: int = 10):
    movie_ids, scores = recommend_movies(user_id, top_n)
    return {"user_id": user_id, "recommendations": movie_ids, "scores": scores}