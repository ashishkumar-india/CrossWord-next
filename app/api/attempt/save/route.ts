import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

// POST /api/attempt/save — autosave answers
export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { attempt_id, answers } = await req.json();
    if (!attempt_id || !answers) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const db = createAdminClient();
    const { data: attempt } = await db.from('attempts').select('id').eq('id', attempt_id).eq('student_id', user.id).single();
    if (!attempt) return NextResponse.json({ error: 'Invalid attempt' }, { status: 403 });

    const { error } = await db.from('attempts').update({ answers }).eq('id', attempt_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, timestamp: Date.now() });
}
