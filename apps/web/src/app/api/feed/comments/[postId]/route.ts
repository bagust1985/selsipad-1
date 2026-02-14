import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ postId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { postId } = await params;
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select('id, content, created_at, user_id')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ comments: [] });
    }

    // Fetch author profiles
    const authorIds = [...new Set(data.map((c) => c.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url, bluecheck_status')
      .in('user_id', authorIds);

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    const comments = data.map((comment: any) => {
      const author: any = profileMap.get(comment.user_id) || {};
      return {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        like_count: 0,
        author: {
          id: comment.user_id,
          username: author.username || 'Anonymous',
          avatar_url: author.avatar_url,
          bluecheck: author.bluecheck_status === 'ACTIVE' || author.bluecheck_status === 'VERIFIED',
        },
      };
    });

    return NextResponse.json({ comments });
  } catch (err) {
    console.error('Error fetching comments:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { postId } = await params;
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Get author profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url, bluecheck_status')
      .eq('user_id', user.id)
      .single();

    const { data: comment, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        like_count: 0,
        author: {
          id: user.id,
          username: profile?.username || 'Anonymous',
          avatar_url: profile?.avatar_url,
          bluecheck:
            profile?.bluecheck_status === 'ACTIVE' || profile?.bluecheck_status === 'VERIFIED',
        },
      },
    });
  } catch (err) {
    console.error('Error creating comment:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
