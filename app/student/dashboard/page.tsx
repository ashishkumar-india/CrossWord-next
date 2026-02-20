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
        <div style={{
            minHeight: '100vh',
            padding: '40px 20px',
            position: 'relative'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div className="glass-card" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: '0 0 5px 0', fontSize: '2rem', color: 'var(--dark)' }}>Welcome back, {user.name}! 🎓</h2>
                        <p style={{ margin: 0, color: 'var(--gray)' }}>Program: <strong>{(user as StudentPayload).program}</strong></p>
                    </div>
                    <Link href="/api/auth/student/logout" className="btn-modern secondary">
                        Logout
                    </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ fontSize: '2.5rem', background: 'rgba(99, 102, 241, 0.1)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>🎯</div>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'var(--gray)' }}>Completed Puzzles</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{completedCount}</div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ fontSize: '2.5rem', background: 'rgba(236, 72, 153, 0.1)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>⭐</div>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'var(--gray)' }}>Average Score</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)' }}>{avgScore}%</div>
                        </div>
                    </div>
                </div>

                <div className="glass-card">
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>📚 Available Puzzles</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {puzzles?.map((puzzle: any) => {
                            const attempt = attemptMap.get(puzzle.id);
                            const isCompleted = attempt?.attempt_status === 'completed';
                            const isAbandoned = attempt?.attempt_status === 'abandoned';
                            const inProgress = attempt?.attempt_status === 'in_progress';
                            const isLocked = attempt?.locked;

                            return (
                                <div key={puzzle.id} style={{ padding: '24px', border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'var(--white)', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} className="hover-lift-white">
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: 'var(--dark)' }}>{puzzle.title}</h4>
                                    <div style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                        <p style={{ margin: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><span>👨‍🏫</span> <span>Teacher: {puzzle.teachers?.name}</span></p>
                                        <p style={{ margin: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><span>⏱️</span> <span>Time Limit: {puzzle.time_limit} mins</span></p>
                                    </div>

                                    <div style={{ marginTop: 'auto' }}>
                                        {!attempt || (inProgress && !isLocked) || (!isLocked && !isCompleted && !isAbandoned) ? (
                                            <Link href={`/student/play/${puzzle.id}`} className="btn-modern primary" style={{ display: 'flex', width: '100%' }}>
                                                {inProgress ? 'Resume Puzzle' : 'Start Puzzle'}
                                            </Link>
                                        ) : isCompleted ? (
                                            attempt.result_published ? (
                                                <Link href={`/student/results?puzzle=${puzzle.id}`} className="btn-modern" style={{ display: 'flex', width: '100%', background: 'var(--success)', color: 'white' }}>
                                                    View Result
                                                </Link>
                                            ) : (
                                                <button disabled className="btn-modern secondary" style={{ display: 'flex', width: '100%', cursor: 'not-allowed', opacity: 0.7 }}>
                                                    Result Pending ⏳
                                                </button>
                                            )
                                        ) : isAbandoned ? (
                                            <button disabled className="btn-modern" style={{ display: 'flex', width: '100%', cursor: 'not-allowed', background: 'var(--danger)', color: 'white' }}>
                                                Time Expired ❌
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                        {(!puzzles || puzzles.length === 0) && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--gray)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📭</div>
                                <p>No active puzzles currently available.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
