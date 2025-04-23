import torch
import json
from model import NeuralCollaborativeFiltering

# Load user and movie ID mappings
with open("user_id_map.json", "r") as f:
    user_id_map = json.load(f)

with open("movie_id_map.json", "r") as f:
    movie_id_map = json.load(f)

# Invert movie_id_map for lookup of movie UUIDs from indices
inv_movie_id_map = {v: k for k, v in movie_id_map.items()}

# Model config
NUM_USERS = len(user_id_map)
NUM_MOVIES = len(movie_id_map)
EMBEDDING_DIM = 50

# Load trained model
model = NeuralCollaborativeFiltering(NUM_USERS, NUM_MOVIES, EMBEDDING_DIM)
model.load_state_dict(torch.load("ncf_model.pth", map_location=torch.device("cpu")))
model.eval()

# Recommend movies for UUID user
def recommend_movies(user_uuid, top_n=10):
    if user_uuid not in user_id_map:
        raise ValueError("User UUID not found in map.")
    user_id = user_id_map[user_uuid]
    movie_ids = torch.arange(NUM_MOVIES)
    user_tensor = torch.full((NUM_MOVIES,), user_id, dtype=torch.long)
    scores = model(user_tensor, movie_ids)
    top_scores, top_indices = torch.topk(scores, top_n)
    movie_uuids = [inv_movie_id_map[str(idx.item())] for idx in top_indices]
    return movie_uuids, top_scores.tolist()

# Example usage
if __name__ == "__main__":
    test_user_uuid = "your-test-user-uuid"
    recommended, scores = recommend_movies(test_user_uuid)
    print("Recommended Movie UUIDs:", recommended)
    print("Scores:", scores)