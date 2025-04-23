import torch
import torch.nn as nn
import torch.optim as optim
from server.model import NCF
from supabase import create_client
from dotenv import load_dotenv
import os
from fastapi import FastAPI
import joblib
from fastapi import HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],  # Includes OPTIONS, POST, etc.
    allow_headers=["*"],
)

load_dotenv()

# Supabase client setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load user-movie interactions with weights
def load_data():
    interactions = []
    weights = {
        "interactions": 1.0,
        "ratings": 1.5,
        "watch_history": 1.2,
        "watchlist": 0.7
    }
    for table, weight in weights.items():
        response = supabase.from_(table).select("user_id, movie_id").execute()
        if response.data:
            interactions.extend((row["user_id"], row["movie_id"], weight) for row in response.data)
    return interactions

interactions = load_data()
# Map UUIDs to integer IDs, with persistence
user_id_map = {}
movie_id_map = {}
if os.path.exists("user_id_map.pkl") and os.path.exists("movie_id_map.pkl"):
    user_id_map = joblib.load(open("user_id_map.pkl", "rb"))
    movie_id_map = joblib.load(open("movie_id_map.pkl", "rb"))
else:
    user_id_map = {uuid: idx for idx, uuid in enumerate(sorted(set(i[0] for i in interactions)))}
    movie_id_map = {uuid: idx for idx, uuid in enumerate(sorted(set(i[1] for i in interactions)))}
    # Save the ID mappings for inference use
    joblib.dump(user_id_map, "user_id_map.pkl")
    joblib.dump(movie_id_map, "movie_id_map.pkl")

user_ids = [user_id_map[i[0]] for i in interactions if i[1] in movie_id_map]
movie_ids = [movie_id_map[i[1]] for i in interactions if i[1] in movie_id_map]
weights = [i[2] for i in interactions if i[1] in movie_id_map]

num_users = max(user_ids) + 1
num_movies = max(movie_ids) + 1

model = NCF(num_users=num_users, num_movies=num_movies, embedding_dim=50)
criterion = nn.BCEWithLogitsLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Convert to tensor and normalize weights per user
from collections import defaultdict
import random

# Normalize weights per user
user_interactions = defaultdict(list)
for u, m, w in zip(user_ids, movie_ids, weights):
    user_interactions[u].append((m, w))

user_ids_new, movie_ids_new, weights_new = [], [], []
for u, interactions in user_interactions.items():
    total_weight = sum(w for _, w in interactions)
    for m, w in interactions:
        user_ids_new.append(u)
        movie_ids_new.append(m)
        weights_new.append(w / total_weight)  # normalize weight

user_tensor = torch.tensor(user_ids_new, dtype=torch.long)
movie_tensor = torch.tensor(movie_ids_new, dtype=torch.long)
label_tensor = torch.tensor(weights_new, dtype=torch.float)

# Personalized negative sampling
negative_interactions = []
all_movie_ids = list(movie_id_map.values())
for uid in set(user_ids_new):
    user_movies = set(m for u, m in zip(user_ids_new, movie_ids_new) if u == uid)
    for _ in range(5):
        neg_m = random.choice([m for m in all_movie_ids if m not in user_movies])
        negative_interactions.append((uid, neg_m))

if negative_interactions:
    neg_user_ids, neg_movie_ids = zip(*negative_interactions)
    neg_user_tensor = torch.tensor(neg_user_ids, dtype=torch.long)
    neg_movie_tensor = torch.tensor(neg_movie_ids, dtype=torch.long)
    neg_label_tensor = torch.zeros(len(neg_user_tensor), dtype=torch.float)

    # Combine positive and negative
    user_tensor = torch.cat([user_tensor, neg_user_tensor])
    movie_tensor = torch.cat([movie_tensor, neg_movie_tensor])
    label_tensor = torch.cat([label_tensor, neg_label_tensor])
# Train
epochs = 20
for epoch in range(epochs):
    model.train()
    optimizer.zero_grad()
    outputs = model(user_tensor, movie_tensor).squeeze()
    loss = criterion(outputs, label_tensor)
    loss.backward()
    optimizer.step()
    print(f"[TRAINING] Epoch {epoch + 1}/{epochs}, Loss: {loss.item()}")

# Save model
torch.save(model.state_dict(), "ncf_model.pth")
print("Model training complete and saved to ncf_model.pth")

class RecommendationRequest(BaseModel):
    user_id: str
    top_k: int

# Reload model for inference
model.load_state_dict(torch.load("ncf_model.pth", map_location=torch.device("cpu")))
model.eval()

@app.post("/recommendations")
def recommend_movies(req: RecommendationRequest):
    user_id_map = joblib.load(open("user_id_map.pkl", "rb"))
    movie_id_map = joblib.load(open("movie_id_map.pkl", "rb"))
    if req.user_id not in user_id_map:
        raise HTTPException(status_code=404, detail="User ID not found")

    user_idx = torch.tensor([user_id_map[req.user_id]] * len(movie_id_map), dtype=torch.long)
    movie_indices = torch.tensor(list(movie_id_map.values()), dtype=torch.long)

    with torch.no_grad():
        predictions = model(user_idx, movie_indices).squeeze()
        top_k = min(req.top_k, predictions.size(0))  # Ensure k does not exceed available predictions
        top_k_indices = torch.topk(predictions, top_k).indices.tolist()

    movie_ids = list(movie_id_map.keys())
    recommended = [movie_ids[i] for i in top_k_indices]

    return {"user_id": req.user_id, "recommendations": recommended}
