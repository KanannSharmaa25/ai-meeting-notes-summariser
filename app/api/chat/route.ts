import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { meetingId, message, userId }: { meetingId: string; message: string; userId: string } = await request.json();

    // For demo purposes, return a mock response if supabase is not configured
    if (!supabase) {
      const mockResponse = `Based on the meeting content, here's what I can tell you about "${message}": This is a demo response. In a full implementation, I would analyze the actual meeting data to provide specific answers.`;
      return NextResponse.json({ response: mockResponse });
    }

    // Get meeting data
    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .eq('user_id', userId)
      .single();

    if (error || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Generate AI response
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a helpful AI assistant answering questions about a specific meeting. Use the meeting content and summary provided below to answer the user's question accurately.

Meeting Title: ${meeting.title}
Meeting Content: ${meeting.content}
Meeting Summary: ${JSON.stringify(meeting.summary)}

User Question: ${message}

Please provide a helpful, accurate response based on the meeting information. If the question cannot be answered from the meeting data, say so politely.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text().trim();

    // Save chat message to database
    await supabase
      .from('chat_messages')
      .insert({
        meeting_id: meetingId,
        user_id: userId,
        message,
        response: aiResponse,
      });

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error('Error in chat:', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('meetingId');
    const userId = searchParams.get('userId');

    if (!meetingId || !userId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ messages: [] }); // Demo mode
    }

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('meeting_id', meetingId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}