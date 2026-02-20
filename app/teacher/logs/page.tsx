import { createAdminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyToken, TEACHER_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ViewLogs() {
    const cookieStore = await cookies();
    const user = await verifyToken(cookieStore.get(TEACHER_COOKIE)?.value || '');
    if (!user || user.role !== 'teacher') return null;

    const db = createAdminClient();

    const { data: logs } = await db
        .from('login_logs')
        .select('*')
        .order('login_time', { ascending: false })
        .limit(100);

    return (
        <div className="container dashboard">
            <div className="content-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>🛡️ Security & Access Logs</h2>
                    <a href="/teacher/dashboard" className="btn btn-secondary">← Back</a>
                </div>

                {!logs || logs.length === 0 ? <p>No logs found.</p> : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>User Type</th>
                                    <th>Email/Name</th>
                                    <th>IP Address</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.login_time).toLocaleString()}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{log.user_type}</td>
                                        <td>{log.email}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{log.ip_address}</td>
                                        <td>
                                            <span className={`status-badge ${log.status === 'success' ? 'status-published' : 'status-abandoned'}`}>
                                                {log.status}
                                            </span>
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
