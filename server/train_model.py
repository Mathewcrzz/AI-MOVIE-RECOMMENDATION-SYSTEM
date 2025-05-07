import torch
import torch.nn as nn
from supabase import create_client
import os, json
from dotenv import load_dotenv
from model import NeuralCollaborativeFiltering

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load mappings
with open("user_id_map.json", "r") as f:
    user_id_map = json.load(f)

with open("movie_id_map.json", "r") as f:
    movie_id_map = json.load(f)

# Load data
response = supabase.table("user_interactions").select("user_id, movie_id, rating").execute()
interactions = response.data

# Convert UUIDs to numeric indices
data = [
    (user_id_map[entry["user_id"]], movie_id_map[entry["movie_id"]], float(entry["rating"]))
    for entry in interactions
    if entry["user_id"] in user_id_map and entry["movie_id"] in movie_id_map
]

# Load watchlist data too
watchlist_response = supabase.table("watchlist").select("user_id, movie_id").execute()
watchlist_data = watchlist_response.data

# Add implicit ratings from watchlist
for entry in watchlist_data:
    if entry["user_id"] in user_id_map and entry["movie_id"] in movie_id_map:
        data.append((
            user_id_map[entry["user_id"]],
            movie_id_map[entry["movie_id"]],
            0.5  # implicit rating for watchlisted movies
        ))

# Training data (fix: cast to LongTensor for embeddings)
user_ids = torch.tensor([d[0] for d in data], dtype=torch.long)
movie_ids = torch.tensor([d[1] for d in data], dtype=torch.long)
ratings = torch.tensor([d[2] for d in data], dtype=torch.float)

# Model setup
model = NeuralCollaborativeFiltering(
    num_users=len(user_id_map),
    num_movies=len(movie_id_map),
    embedding_dim=50
)
loss_fn = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# Train
epochs = 30
for epoch in range(epochs):
    model.train()
    preds = model(user_ids, movie_ids).squeeze()
    loss = loss_fn(preds, ratings)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
    print(f"Epoch {epoch + 1}/{epochs} - Loss: {loss.item()}")

# Save model
torch.save(model.state_dict(), "ncf_model.pth")
print("✅ Model trained and saved as ncf_model.pth")