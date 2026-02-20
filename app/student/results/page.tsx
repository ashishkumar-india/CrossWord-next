import { createAdminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyToken, STUDENT_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function StudentResults() {
    const cookieStore = await cookies();
    const user = await verifyToken(cookieStore.get(STUDENT_COOKIE)?.value || '');
    if (!user || user.role !== 'student') return null;

    const db = createAdminClient();

    const { data: attempts } = await db
        .from('attempts')
        .select('id, score, time_taken, attempt_status, locked, result_published, completed_at, answers, puzzles!inner(title, teacher_id, correct_answers)')
        .eq('student_id', user.id)
        .order('completed_at', { ascending: false });

    // Separate published vs unpublished
    const published = attempts?.filter(a => a.result_published && a.attempt_status === 'completed') || [];
    const pending = attempts?.filter(a => !a.result_published || a.attempt_status !== 'completed') || [];

    return (
        <div className="container dashboard">
            <div className="content-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>📈 My Results</h2>
                    <a href="/student/dashboard" className="btn btn-secondary">← Dashboard</a>
                </div>

                {published.length === 0 && pending.length === 0 ? (
                    <p>You haven't attempted any puzzles yet.</p>
                ) : (
                    <>
                        {published.length > 0 && (
                            <div style={{ marginBottom: '40px' }}>
                                <h3>✅ Published Results</h3>
                                <div className="puzzles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '15px' }}>
                                    {published.map((a: any) => (
                                        <div key={a.id} className="puzzle-card" style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', background: '#fff' }}>
                                            <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{a.puzzles?.title}</h4>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                <div>
                                                    <strong style={{ fontSize: '24px', color: a.score >= 70 ? '#10b981' : a.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                                                        {a.score}%
                                                    </strong>
                                                </div>
                                                <div style={{ textAlign: 'right', color: '#666', fontSize: '14px' }}>
                                                    <p style={{ margin: 0 }}>⏱️ {Math.floor(a.time_taken / 60)}m {a.time_taken % 60}s</p>
                                                    <p style={{ margin: 0 }}>📅 {new Date(a.completed_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            {/* Optional: we could add a "View Detailed Grid" button here that links to a read-only View component */}
                                            <button className="btn btn-secondary" style={{ width: '100%', cursor: 'not-allowed' }}>
                                                Grid View Coming Soon
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {pending.length > 0 && (
                            <div>
                                <h3>⏳ Pending / In-Progress</h3>
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Puzzle</th>
                                                <th>Status</th>
                                                <th>Started / Completed</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pending.map((a: any) => (
                                                <tr key={a.id}>
                                                    <td>{a.puzzles?.title}</td>
                                                    <td>
                                                        <span className={`status-badge ${a.attempt_status === 'in_progress' ? 'status-draft' : a.attempt_status === 'completed' ? 'status-published' : 'status-abandoned'}`}>
                                                            {a.attempt_status === 'completed' ? 'Awaiting Teacher Review' : a.attempt_status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td>{a.completed_at ? new Date(a.completed_at).toLocaleDateString() : 'Active'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
