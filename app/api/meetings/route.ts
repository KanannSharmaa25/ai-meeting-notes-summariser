import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // For demo purposes, return empty array if supabase is not configured
    if (!supabase) {
      return NextResponse.json({ meetings: [], total: 0 });
    }

    let query = supabase
      .from('meetings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data: meetings, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
    }

    return NextResponse.json({ meetings, total: count });
  } catch (error: any) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!meetingId || !userId) {
      return NextResponse.json({ error: 'Meeting ID and User ID required' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ success: true }); // Demo mode
    }

    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', meetingId)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
    }

    // Also delete associated chat messages
    await supabase
      .from('chat_messages')
      .delete()
      .eq('meeting_id', meetingId)
      .eq('user_id', userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, userId, title }: { id: string; userId: string; title: string } = await request.json();

    if (!supabase) {
      return NextResponse.json({ success: true }); // Demo mode
    }

    const { error } = await supabase
      .from('meetings')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating meeting:', error);
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
  }
}