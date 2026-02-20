import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { calculateScore } from '@/lib/crossword';

// POST /api/attempt/submit
export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { attempt_id, puzzle_id, answers, time_taken } = await req.json();
    if (!attempt_id || !puzzle_id || !answers)
        return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const db = createAdminClient();

    // Verify ownership
    const { data: attempt } = await db
        .from('attempts')
        .select('id')
        .eq('id', attempt_id)
        .eq('student_id', user.id)
        .eq('puzzle_id', puzzle_id)
        .single();
    if (!attempt) return NextResponse.json({ error: 'Invalid attempt' }, { status: 403 });

    // Get correct answers
    const { data: puzzle } = await db.from('puzzles').select('correct_answers').eq('id', puzzle_id).single();
    if (!puzzle) return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 });

    const { correct, wrong, total, score } = calculateScore(puzzle.correct_answers, answers);

    const { error } = await db.from('attempts').update({
        answers, time_taken: time_taken ?? 0, score,
        correct_answers: correct, wrong_answers: wrong, total_questions: total,
        attempt_status: 'completed', locked: true, completed_at: new Date().toISOString(),
    }).eq('id', attempt_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, score, correct, wrong, total });
}
