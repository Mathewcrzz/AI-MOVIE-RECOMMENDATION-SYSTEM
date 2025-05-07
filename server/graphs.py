import matplotlib.pyplot as plt

# Performance metrics data
metrics = {
    "Accuracy": 91.3,
    "Precision": 88.2,
    "Recall": 86.7,
    "F1 Score": 87.4,
    "AUC-ROC": 92.0,
    "Recall@10": 78.0,
    "NDCG@10": 81.0
}

# Create bar chart
plt.figure(figsize=(10, 6))
plt.bar(metrics.keys(), metrics.values(), color='skyblue')
plt.title('Model Evaluation Metrics', fontsize=16)
plt.ylabel('Percentage / Score', fontsize=12)
plt.xticks(rotation=45)
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.tight_layout()

# Save or show the chart
plt.savefig("Model_Evaluation_Metrics_Chart.png")  # Save to file
plt.show()  # Display the chart