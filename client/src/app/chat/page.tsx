"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ role: string; text: string }[]>([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setChat((prev) => [...prev, { role: "user", text: message }]);

    try {
      const res = await fetch("http://localhost:8001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setChat((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        { role: "bot", text: "Oops! Bot server offline." },
      ]);
    }

    setMessage("");
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="#f0f2f5"
      p={2}
    >
      <Card sx={{ width: 400, borderRadius: 4, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
            🤖 Chat with MovieBot
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              height: 300,
              overflowY: "auto",
              p: 1,
              mb: 2,
              bgcolor: "#fafafa",
            }}
          >
            {chat.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    bgcolor: msg.role === "user" ? "#e3f2fd" : "#eeeeee",
                    borderRadius: 2,
                    maxWidth: "70%",
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                </Box>
              </Box>
            ))}
          </Paper>
          <Box display="flex">
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <Button
              variant="contained"
              sx={{ ml: 1 }}
              onClick={sendMessage}
              disabled={!message.trim()}
            >
              Send
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}