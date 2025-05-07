"use client";

import { useState } from "react";
import { sendMessageToChatbot } from "../utils/chatApi";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ user: string; bot: string }[]>([]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const botReply = await sendMessageToChatbot(input);
    setChat([...chat, { user: input, bot: botReply }]);
    setInput("");
  };

  return (
    <div className="p-4 border rounded shadow bg-white max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Movie Chatbot 🎬🤖</h2>
      <div className="space-y-2 mb-4">
        {chat.map((c, i) => (
          <div key={i}>
            <p><strong>You:</strong> {c.user}</p>
            <p><strong>Bot:</strong> {c.bot}</p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className="border p-2 w-full"
        placeholder="Ask me for a movie recommendation..."
      />
      <button onClick={handleSend} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">
        Send
      </button>
    </div>
  );
};

export default Chatbot;