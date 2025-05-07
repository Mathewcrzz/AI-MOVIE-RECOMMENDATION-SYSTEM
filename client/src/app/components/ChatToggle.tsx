'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const ChatBot = dynamic(() => import('./ChatBot'), { ssr: false });

export default function ChatToggle() {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      {showChat && (
        <div className="fixed bottom-20 right-6 z-50">
          <ChatBot />
        </div>
      )}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-red-700 transition-all z-50"
      >
        {showChat ? 'Close Chat' : '💬 Chat'}
      </button>
    </>
  );
}