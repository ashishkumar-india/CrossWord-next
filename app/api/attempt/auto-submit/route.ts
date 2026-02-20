import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { calculateScore } from '@/lib/crossword';

// POST /api/attempt/auto-submit — tab-switch / timer-expired submit
export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { attempt_id, puzzle_id, answers, time_taken, reason } = await req.json();
    if (!attempt_id || !puzzle_id) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const db = createAdminClient();

    const { data: attempt } = await db
        .from('attempts')
        .select('id, attempt_status')
        .eq('id', attempt_id)
        .eq('student_id', user.id)
        .eq('puzzle_id', puzzle_id)
        .single();

    if (!attempt || attempt.attempt_status !== 'in_progress')
        return NextResponse.json({ success: false, error: 'No active attempt' }, { status: 200 });

    const { data: puzzle } = await db.from('puzzles').select('correct_answers').eq('id', puzzle_id).single();
    const { correct, wrong, total, score } = puzzle
        ? calculateScore(puzzle.correct_answers, answers ?? {})
        : { correct: 0, wrong: 0, total: 0, score: 0 };

    const status = reason === 'timeout' ? 'abandoned' : 'completed';
    await db.from('attempts').update({
        answers: answers ?? {}, time_taken: time_taken ?? 0,
        score, correct_answers: correct, wrong_answers: wrong, total_questions: total,
        attempt_status: status, locked: true, completed_at: new Date().toISOString(),
    }).eq('id', attempt_id);

    return NextResponse.json({ success: true, score });
}
