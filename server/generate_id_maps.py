import torch
from model import model  # Assuming the model is defined in model.py and named 'model'
import json
from supabase import create_client, Client
import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Supabase credentials (replace with your real ones or use environment variables)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Fetch unique user IDs
user_response = supabase.table("interactions").select("user_id").execute()
user_ids = list({row["user_id"] for row in user_response.data})

# Fetch unique movie IDs
movie_response = supabase.table("interactions").select("movie_id").execute()
movie_ids = list({row["movie_id"] for row in movie_response.data})

# Create mappings
user_id_map = {uuid: idx for idx, uuid in enumerate(user_ids)}
movie_id_map = {uuid: idx for idx, uuid in enumerate(movie_ids)}

# Save to JSON
with open("user_id_map.json", "w") as f:
    json.dump(user_id_map, f)

with open("movie_id_map.json", "w") as f:
    json.dump(movie_id_map, f)

print("Mappings generated and saved.")

class RecommendationRequest(BaseModel):
    user_id: str
    top_k: int

@app.post("/recommendations")
def recommend_movies(req: RecommendationRequest):
    user_id = req.user_id
    top_k = req.top_k

    # Load user and movie ID maps
    with open("user_id_map.json", "r") as f:
        user_id_map = json.load(f)
    with open("movie_id_map.json", "r") as f:
        movie_id_map = json.load(f)
    inv_movie_id_map = {v: k for k, v in movie_id_map.items()}

    if user_id not in user_id_map:
        return {"message": "User not found", "recommendations": []}

    user_idx = torch.tensor([user_id_map[user_id]], dtype=torch.long)
    movie_indices = torch.tensor(list(movie_id_map.values()), dtype=torch.long)

    user_indices = user_idx.expand_as(movie_indices)

    with torch.no_grad():
        scores = model(user_indices, movie_indices).squeeze()
    top_indices = torch.topk(scores, top_k).indices.tolist()

    recommended_ids = [inv_movie_id_map[i] for i in top_indices]
    return {"user_id": user_id, "recommendations": recommended_ids}