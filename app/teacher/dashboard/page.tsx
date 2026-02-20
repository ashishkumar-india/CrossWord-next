import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase';
import { verifyToken, TEACHER_COOKIE } from '@/lib/auth';
import Link from 'next/link';

export default async function TeacherDashboard() {
    const cookieStore = await cookies();
    const token = cookieStore.get(TEACHER_COOKIE)?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user || user.role !== 'teacher') return null;

    const db = createAdminClient();

    const [
        { count: puzzleCount },
        { count: studentCount },
        { data: recentAttempts }
    ] = await Promise.all([
        db.from('puzzles').select('*', { count: 'exact', head: true }).eq('teacher_id', user.id),
        db.from('students').select('*', { count: 'exact', head: true }).eq('is_active', true),
        db.from('attempts')
            .select('id, score, completed_at, students(name), puzzles!inner(title, teacher_id)')
            .eq('puzzles.teacher_id', user.id)
            .eq('attempt_status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(5)
    ]);

    return (
        <div style={{
            minHeight: '100vh',
            padding: '40px 20px',
            position: 'relative'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div className="glass-card" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: '0 0 5px 0', fontSize: '2rem', color: 'var(--dark)' }}>Welcome back, {user.name}! 👋</h2>
                        <p style={{ margin: 0, color: 'var(--gray)' }}>Manage your crossword puzzles and student progress</p>
                    </div>
                    <Link href="/api/auth/teacher/logout" className="btn-modern secondary">
                        Logout
                    </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ fontSize: '2.5rem', background: 'rgba(99, 102, 241, 0.1)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>🧩</div>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'var(--gray)' }}>Total Puzzles</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{puzzleCount ?? 0}</div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ fontSize: '2.5rem', background: 'rgba(16, 185, 129, 0.1)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>👥</div>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'var(--gray)' }}>Active Students</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{studentCount ?? 0}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'revert', gap: '30px' }} className="dashboard-grid">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', alignContent: 'start' }}>
                        <Link href="/teacher/create" className="glass-card hover-lift-white" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>➕</div>
                            <h3 style={{ margin: '0 0 8px 0', color: 'var(--dark)' }}>Create New Puzzle</h3>
                            <p style={{ margin: 0, color: 'var(--gray)', fontSize: '0.9rem' }}>Generate a new crossword puzzle for your students</p>
                        </Link>

                        <Link href="/teacher/puzzles" className="glass-card hover-lift-white" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>📚</div>
                            <h3 style={{ margin: '0 0 8px 0', color: 'var(--dark)' }}>Manage Puzzles</h3>
                            <p style={{ margin: 0, color: 'var(--gray)', fontSize: '0.9rem' }}>View, edit, or delete your existing puzzles</p>
                        </Link>

                        <Link href="/teacher/students" className="glass-card hover-lift-white" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>👨‍🎓</div>
                            <h3 style={{ margin: '0 0 8px 0', color: 'var(--dark)' }}>View Students</h3>
                            <p style={{ margin: 0, color: 'var(--gray)', fontSize: '0.9rem' }}>Manage student accounts and access</p>
                        </Link>

                        <Link href="/teacher/results" className="glass-card hover-lift-white" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>📊</div>
                            <h3 style={{ margin: '0 0 8px 0', color: 'var(--dark)' }}>Student Results</h3>
                            <p style={{ margin: 0, color: 'var(--gray)', fontSize: '0.9rem' }}>Review scores and puzzle attempts</p>
                        </Link>
                    </div>

                    <div className="glass-card" style={{ height: 'fit-content' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>Recent Completions</h3>
                        {!recentAttempts || recentAttempts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--gray)' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⏳</div>
                                <p style={{ margin: 0 }}>No recent puzzle completions yet.</p>
                            </div>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {recentAttempts.map((attempt: any) => (
                                    <li key={attempt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'var(--white)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                                        <div>
                                            <div style={{ color: 'var(--dark)', marginBottom: '4px' }}>
                                                <strong>{attempt.students?.name}</strong> completed <em>{attempt.puzzles?.title}</em>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                                                {new Date(attempt.completed_at).toLocaleString()}
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontWeight: 'bold',
                                            background: attempt.score >= 70 ? 'rgba(16, 185, 129, 0.1)' : attempt.score >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: attempt.score >= 70 ? 'var(--success)' : attempt.score >= 50 ? 'var(--warning)' : 'var(--danger)'
                                        }}>
                                            {attempt.score}%
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
