from fastapi import FastAPI
from inference import recommend_movies

app = FastAPI()

@app.get("/recommendations/{user_id}")
def get_recommendations(user_id: int, top_n: int = 10):
    movie_ids, scores = recommend_movies(user_id, top_n)
    return {
        "user_id": user_id,
        "recommendations": movie_ids,
        "scores": scores
    }

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from model import NeuralCollaborativeFiltering
import random

# Mock dataset
class InteractionDataset(Dataset):
    def __init__(self, num_users, num_movies, num_samples=10000):
        self.num_users = num_users
        self.num_movies = num_movies
        self.samples = [
            (random.randint(0, num_users - 1), random.randint(0, num_movies - 1), random.choice([0, 1]))
            for _ in range(num_samples)
        ]

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        user_id, movie_id, label = self.samples[idx]
        return torch.tensor(user_id), torch.tensor(movie_id), torch.tensor(label, dtype=torch.float32)

# Hyperparameters
NUM_USERS = 1000
NUM_MOVIES = 500
EMBEDDING_DIM = 50
BATCH_SIZE = 64
EPOCHS = 5
LR = 0.001

# Data
dataset = InteractionDataset(NUM_USERS, NUM_MOVIES)
dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)

# Model
model = NeuralCollaborativeFiltering(NUM_USERS, NUM_MOVIES, EMBEDDING_DIM)
criterion = nn.BCELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=LR)

# Training loop
model.train()
for epoch in range(EPOCHS):
    total_loss = 0
    for user_ids, movie_ids, labels in dataloader:
        optimizer.zero_grad()
        outputs = model(user_ids, movie_ids)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    print(f"Epoch {epoch+1}/{EPOCHS}, Loss: {total_loss:.4f}")
    torch.save(model.state_dict(), "ncf_model.pth")