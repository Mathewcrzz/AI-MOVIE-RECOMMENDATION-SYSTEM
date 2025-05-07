from fastapi import FastAPI, Request
from inference import recommend_movies
from chatbot import get_chatbot_response  # make sure this function exists

app = FastAPI()

@app.get("/recommendations/{user_id}")
def get_recommendations(user_id: int, top_n: int = 10):
    movie_ids, scores = recommend_movies(user_id, top_n)
    return {"user_id": user_id, "recommendations": movie_ids, "scores": scores}

@app.post("/chatbot")
async def chatbot_reply(request: Request):
    body = await request.json()
    user_message = body.get("message", "")
    reply = get_chatbot_response(user_message)
    return {"reply": reply}