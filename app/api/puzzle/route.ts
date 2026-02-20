import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { buildCompactCrossword, buildCorrectAnswers } from '@/lib/crossword';

// GET /api/puzzle — list teacher's puzzles
export async function GET() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = createAdminClient();
    const { data, error } = await db
        .from('puzzles')
        .select('id, title, time_limit, grid_size, is_active, created_at, attempts(count)')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// POST /api/puzzle — create puzzle
export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, time_limit, words } = await req.json();
    if (!title || !words?.length || time_limit < 5 || time_limit > 120)
        return NextResponse.json({ error: 'Invalid puzzle data' }, { status: 400 });

    const result = buildCompactCrossword(words);
    if (!result) return NextResponse.json({ error: 'Could not build crossword – check word intersections' }, { status: 422 });

    const correctAnswers = buildCorrectAnswers(result.placedWords);
    const acrossClues = result.placedWords.filter(w => w.direction === 'across').map(w => `${w.number}. ${w.clue}`).join('\n');
    const downClues = result.placedWords.filter(w => w.direction === 'down').map(w => `${w.number}. ${w.clue}`).join('\n');

    const db = createAdminClient();
    const { data, error } = await db.from('puzzles').insert({
        teacher_id: user.id, title, time_limit,
        grid_size: Math.max(result.grid.length, result.grid[0]?.length ?? 0),
        grid_data: result.grid, correct_answers: correctAnswers,
        clues_across: acrossClues, clues_down: downClues, is_active: true,
    }).select('id').single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, id: data.id, placedWords: result.placedWords });
}
