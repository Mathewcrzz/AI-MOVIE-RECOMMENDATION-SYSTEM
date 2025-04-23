import torch

checkpoint = torch.load("ncf_model.pth", map_location=torch.device("cpu"))

print("Checkpoint keys:")
for k, v in checkpoint.items():
    print(f"{k} → shape: {v.shape}")