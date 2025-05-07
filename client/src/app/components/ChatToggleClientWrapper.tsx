'use client';

import dynamic from 'next/dynamic';

const ChatToggle = dynamic(() => import('./ChatToggle'), { ssr: false });

export default function ChatToggleClientWrapper() {
  return <ChatToggle />;
}