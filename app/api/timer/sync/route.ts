import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

// GET /api/timer/sync?puzzle_id=xxx&attempt_id=xxx
export async function GET(req: Request) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const puzzle_id = searchParams.get('puzzle_id');
    const attempt_id = searchParams.get('attempt_id');
    if (!puzzle_id || !attempt_id) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const db = createAdminClient();

    const [{ data: puzzle }, { data: attempt }] = await Promise.all([
        db.from('puzzles').select('time_limit').eq('id', puzzle_id).single(),
        db.from('attempts').select('start_time').eq('id', attempt_id).eq('student_id', user.id).single(),
    ]);

    if (!puzzle || !attempt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const startTime = new Date(attempt.start_time).getTime();
    const timeLimitMs = puzzle.time_limit * 60 * 1000;
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, timeLimitMs - elapsed);

    return NextResponse.json({ remaining_ms: remaining, server_time: Date.now() });
}
