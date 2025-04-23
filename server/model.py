

import torch
import torch.nn as nn
import torch.nn.functional as F

class NeuralCollaborativeFiltering(nn.Module):
    def __init__(self, num_users, num_movies, embedding_dim=50):
        super(NeuralCollaborativeFiltering, self).__init__()

        self.user_embedding = nn.Embedding(num_users, embedding_dim)
        self.movie_embedding = nn.Embedding(num_movies, embedding_dim)

        self.fc1 = nn.Linear(embedding_dim * 2, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 1)

    def forward(self, user_ids, movie_ids):
        user_vecs = self.user_embedding(user_ids)
        movie_vecs = self.movie_embedding(movie_ids)

        x = torch.cat([user_vecs, movie_vecs], dim=-1)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        out = torch.sigmoid(self.fc3(x))

        return out.squeeze()


# Alias for import compatibility
NCF = NeuralCollaborativeFiltering