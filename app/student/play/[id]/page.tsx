import { createAdminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyToken, STUDENT_COOKIE } from '@/lib/auth';
import { redirect } from 'next/navigation';
import InteractivePuzzle from './InteractivePuzzle';

export const dynamic = 'force-dynamic';

export default async function PlayPuzzle({ params }: { params: Promise<{ id: string }> }) {
    const { id: puzzleId } = await params;
    const cookieStore = await cookies();
    const user = await verifyToken(cookieStore.get(STUDENT_COOKIE)?.value || '');
    if (!user || user.role !== 'student') redirect('/auth/student/login');

    const db = createAdminClient();

    // 1. Get puzzle
    const { data: puzzle } = await db
        .from('puzzles')
        .select('id, title, time_limit, grid_data, clues_across, clues_down, is_active, teachers(name)')
        .eq('id', puzzleId)
        .single();

    if (!puzzle || !puzzle.is_active) {
        return (
            <div className="container dashboard"><div className="content-box"><h2>Puzzle not available.</h2><a href="/student/dashboard">Back</a></div></div>
        );
    }

    // 2. Manage attempt
    let attemptId = '';
    let savedAnswers = {};
    let timeRemainingMs = puzzle.time_limit * 60 * 1000;

    const { data: existing } = await db
        .from('attempts')
        .select('id, attempt_status, locked, answers, start_time')
        .eq('puzzle_id', puzzleId)
        .eq('student_id', user.id)
        .single();

    if (existing) {
        if (existing.locked || existing.attempt_status !== 'in_progress') {
            redirect('/student/dashboard');
        }
        attemptId = existing.id;
        savedAnswers = existing.answers || {};

        const elapsed = Date.now() - new Date(existing.start_time).getTime();
        timeRemainingMs = Math.max(0, (puzzle.time_limit * 60 * 1000) - elapsed);
        if (timeRemainingMs === 0) {
            await db.from('attempts').update({ attempt_status: 'abandoned', locked: true }).eq('id', attemptId);
            redirect('/student/dashboard');
        }
    } else {
        // Create new attempt
        const { data: newAttempt, error } = await db
            .from('attempts')
            .insert({
                student_id: user.id, puzzle_id: puzzleId,
                attempt_status: 'in_progress', locked: false,
                answers: {}, start_time: new Date().toISOString()
            })
            .select('id')
            .single();

        if (error || !newAttempt) return <div>Error starting attempt</div>;
        attemptId = newAttempt.id;
    }

    return (
        <InteractivePuzzle
            puzzleId={puzzleId}
            attemptId={attemptId}
            puzzleData={puzzle}
            initialAnswers={savedAnswers}
            initialTimeRemainingMs={timeRemainingMs}
            timeLimit={puzzle.time_limit}
        />
    );
}
