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
        <div className="container dashboard">
            <div className="welcome-section">
                <h2>Welcome back, {user.name}! 👋</h2>
                <p>Manage your crossword puzzles and student progress</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">🧩</div>
                    <div className="stat-content">
                        <h3>Total Puzzles</h3>
                        <div className="stat-value">{puzzleCount ?? 0}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>Active Students</h3>
                        <div className="stat-value">{studentCount ?? 0}</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="action-cards">
                    <Link href="/teacher/create" className="action-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="action-icon">➕</div>
                        <h3>Create New Puzzle</h3>
                        <p>Generate a new crossword puzzle for your students</p>
                    </Link>
                    <Link href="/teacher/puzzles" className="action-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="action-icon">📚</div>
                        <h3>Manage Puzzles</h3>
                        <p>View, edit, or delete your existing puzzles</p>
                    </Link>
                    <Link href="/teacher/students" className="action-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="action-icon">👨‍🎓</div>
                        <h3>View Students</h3>
                        <p>Manage student accounts and access</p>
                    </Link>
                    <Link href="/teacher/results" className="action-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="action-icon">📊</div>
                        <h3>Student Results</h3>
                        <p>Review scores and puzzle attempts</p>
                    </Link>
                </div>

                <div className="recent-activity content-box">
                    <h3>Recent Completions</h3>
                    {!recentAttempts || recentAttempts.length === 0 ? (
                        <p style={{ color: '#666' }}>No recent puzzle completions yet.</p>
                    ) : (
                        <ul className="activity-list" style={{ listStyle: 'none', padding: 0 }}>
                            {recentAttempts.map((attempt: any) => (
                                <li key={attempt.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                                    <div>
                                        <strong>{attempt.students?.name}</strong> completed <em>{attempt.puzzles?.title}</em>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            {new Date(attempt.completed_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <strong style={{ color: attempt.score >= 70 ? 'green' : attempt.score >= 50 ? 'orange' : 'red' }}>
                                            {attempt.score}%
                                        </strong>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
