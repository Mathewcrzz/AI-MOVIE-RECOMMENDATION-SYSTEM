from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from pydantic import BaseModel
import requests
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import os
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
print("SUPABASE_URL =", SUPABASE_URL)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

chatbot = pipeline("text2text-generation", model="google/flan-t5-small")
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify your frontend URL for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(request: ChatRequest):
    user_input = request.message
    try:
        prompt = f"Suggest a great movie to a user based on this request: {user_input}"
        response = chatbot(prompt, max_length=60, do_sample=True, temperature=0.8)
        reply = response[0]['generated_text']

        # Log to Supabase
        supabase.table("chat_logs").insert({"message": user_input, "reply": reply}).execute()

        return {"reply": reply}
    except Exception as e:
        print("LLM Error:", e)
        return {"reply": "Sorry, I had trouble thinking of a movie. Try again!"}

@app.get("/healthz")
def health():
    return {"status": "chatbot is healthy and running 🚀"}

@app.get("/chat-logs")
def get_chat_logs():
    try:
        response = supabase.table("chat_logs").select("*").order("id", desc=True).limit(50).execute()
        return {"logs": response.data}
    except Exception as e:
        print("Failed to fetch chat logs:", e)
        return {"logs": []}
def get_chatbot_response(message: str) -> str:
    try:
        prompt = f"Suggest a great movie to a user based on this request: {message}"
        response = chatbot(prompt, max_length=60, do_sample=True, temperature=0.8)
        reply = response[0]['generated_text']
        return reply
    except Exception as e:
        print("Chatbot response error:", e)
        return "Sorry, I had trouble thinking of a movie. Try again!"