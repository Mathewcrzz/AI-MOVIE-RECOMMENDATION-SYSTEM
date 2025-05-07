// client/utils/chatApi.ts
export const sendMessageToChatbot = async (message: string) => {
    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
  
      const data = await response.json();
      return data.reply;
    } catch (err) {
      console.error("Chatbot error:", err);
      return "Oops! Something went wrong.";
    }
  };