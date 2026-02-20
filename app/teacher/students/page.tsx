import { createAdminClient } from '@/lib/supabase';
import StudentActions from './StudentActions';

export const dynamic = 'force-dynamic';

export default async function ViewStudents() {
    const db = createAdminClient();

    // Fetch students with their attempt counts
    const { data: students } = await db
        .from('students')
        .select('id, name, program, is_active, created_at, attempts(count)')
        .order('created_at', { ascending: false });

    return (
        <div className="container dashboard">
            <div className="content-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>👨‍🎓 Registered Students</h2>
                    <a href="/teacher/dashboard" className="btn btn-secondary">← Back</a>
                </div>

                {!students || students.length === 0 ? <p>No registered students.</p> : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Program</th>
                                    <th>Registered Date</th>
                                    <th>Attempts</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.name}</td>
                                        <td>{s.program}</td>
                                        <td>{new Date(s.created_at).toLocaleDateString()}</td>
                                        <td>{s.attempts[0]?.count || 0}</td>
                                        <td>
                                            <span className={`status-badge ${s.is_active ? 'status-published' : 'status-draft'}`}>
                                                {s.is_active ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td>
                                            <StudentActions studentId={s.id} isActive={s.is_active} />
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
