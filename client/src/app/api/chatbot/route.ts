import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    // Dummy chatbot response logic — replace this with your real logic
    const botReply = getChatbotReply(message);

    return NextResponse.json({ reply: botReply });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function getChatbotReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('recommend')) {
    return 'Sure! Try watching *Inception* or *Interstellar*.';
  } else if (lower.includes('2 hours')) {
    return 'You might like *Zombieland* or *The Social Network* — both are under 2 hours!';
  } else {
    return `Hmm, I didn’t catch that. Try asking for a recommendation!`;
  }
}