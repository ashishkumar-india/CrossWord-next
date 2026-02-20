import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase';
import { verifyToken, STUDENT_COOKIE, StudentPayload } from '@/lib/auth';
import Link from 'next/link';

export default async function StudentDashboard() {
    const cookieStore = await cookies();
    const token = cookieStore.get(STUDENT_COOKIE)?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user || user.role !== 'student') return null;

    const db = createAdminClient();

    // Get active puzzles not yet completed
    const { data: puzzles } = await db.from('puzzles')
        .select('id, title, time_limit, teachers(name), created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    // Get student's attempts
    const { data: attempts } = await db.from('attempts')
        .select('puzzle_id, attempt_status, locked, result_published, score')
        .eq('student_id', user.id);

    const attemptMap = new Map(attempts?.map(a => [a.puzzle_id, a]));

    const scoreSum = attempts?.reduce((acc, curr) => curr.attempt_status === 'completed' ? acc + Number(curr.score) : acc, 0) ?? 0;
    const completedCount = attempts?.filter(a => a.attempt_status === 'completed').length ?? 0;
    const avgScore = completedCount > 0 ? (scoreSum / completedCount).toFixed(1) : 0;

    return (
        <div className="container dashboard">
            <div className="welcome-section">
                <h2>Welcome back, {user.name}! 🎓</h2>
                <p>Program: <strong>{(user as StudentPayload).program}</strong></p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                        <h3>Completed Puzzles</h3>
                        <div className="stat-value">{completedCount}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-content">
                        <h3>Average Score</h3>
                        <div className="stat-value">{avgScore}%</div>
                    </div>
                </div>
            </div>

            <div className="content-box">
                <h3>📚 Available Puzzles</h3>
                <div className="puzzles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {puzzles?.map((puzzle: any) => {
                        const attempt = attemptMap.get(puzzle.id);
                        const isCompleted = attempt?.attempt_status === 'completed';
                        const isAbandoned = attempt?.attempt_status === 'abandoned';
                        const inProgress = attempt?.attempt_status === 'in_progress';
                        const isLocked = attempt?.locked;

                        return (
                            <div key={puzzle.id} className="puzzle-card" style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', background: '#fff' }}>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{puzzle.title}</h4>
                                <div className="puzzle-meta" style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                                    <p style={{ margin: '5px 0' }}>👨‍🏫 Teacher: {puzzle.teachers?.name}</p>
                                    <p style={{ margin: '5px 0' }}>⏱️ Time Limit: {puzzle.time_limit} mins</p>
                                </div>

                                <div className="puzzle-action">
                                    {!attempt || (inProgress && !isLocked) || (!isLocked && !isCompleted && !isAbandoned) ? (
                                        <Link href={`/student/play/${puzzle.id}`} className="btn btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                                            {inProgress ? 'Resume Puzzle' : 'Start Puzzle'}
                                        </Link>
                                    ) : isCompleted ? (
                                        attempt.result_published ? (
                                            <Link href={`/student/results?puzzle=${puzzle.id}`} className="btn btn-success" style={{ display: 'block', textAlign: 'center', background: '#10b981' }}>
                                                View Result
                                            </Link>
                                        ) : (
                                            <button disabled className="btn btn-secondary" style={{ display: 'block', width: '100%', cursor: 'not-allowed' }}>
                                                Result Pending ⏳
                                            </button>
                                        )
                                    ) : isAbandoned ? (
                                        <button disabled className="btn btn-danger" style={{ display: 'block', width: '100%', cursor: 'not-allowed', background: '#ef4444' }}>
                                            Time Expired ❌
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                    {(!puzzles || puzzles.length === 0) && (
                        <p style={{ color: '#666' }}>No active puzzles currently available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
