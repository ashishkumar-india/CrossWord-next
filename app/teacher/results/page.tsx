import { createAdminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyToken, TEACHER_COOKIE } from '@/lib/auth';
import AttemptActions from './AttemptActions';

export const dynamic = 'force-dynamic';

export default async function TeacherResults() {
    const cookieStore = await cookies();
    const user = await verifyToken(cookieStore.get(TEACHER_COOKIE)?.value || '');
    if (!user || user.role !== 'teacher') return null;

    const db = createAdminClient();

    const { data: attempts } = await db
        .from('attempts')
        .select('id, score, time_taken, attempt_status, locked, result_published, completed_at, students(name, program), puzzles!inner(title, teacher_id)')
        .eq('puzzles.teacher_id', user.id)
        .order('completed_at', { ascending: false });

    return (
        <div className="container dashboard">
            <div className="content-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>📊 Student Results</h2>
                    <a href="/teacher/dashboard" className="btn btn-secondary">← Back</a>
                </div>

                {!attempts || attempts.length === 0 ? <p>No puzzle attempts recorded yet.</p> : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Puzzle</th>
                                    <th>Score</th>
                                    <th>Time Taken</th>
                                    <th>Status</th>
                                    <th>Published</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attempts.map((a: any) => (
                                    <tr key={a.id}>
                                        <td>
                                            <div><strong>{a.students?.name}</strong></div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>{a.students?.program}</div>
                                        </td>
                                        <td>{a.puzzles?.title}</td>
                                        <td>
                                            <span className={`score-badge ${a.score >= 70 ? 'score-high' : a.score >= 50 ? 'score-medium' : 'score-low'}`}>
                                                {a.score}%
                                            </span>
                                        </td>
                                        <td>{Math.floor(a.time_taken / 60)}m {a.time_taken % 60}s</td>
                                        <td>
                                            <span className={`status-badge ${a.attempt_status === 'completed' ? 'status-published' : a.attempt_status === 'in_progress' ? 'status-draft' : 'status-abandoned'}`}>
                                                {a.attempt_status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>{a.result_published ? '✅ Yes' : '❌ No'}</td>
                                        <td>
                                            <AttemptActions
                                                attemptId={a.id}
                                                isPublished={a.result_published}
                                                isLocked={a.locked}
                                                isCompleted={a.attempt_status === 'completed'}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
