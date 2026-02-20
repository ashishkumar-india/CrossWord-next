'use client';
import { useEffect, useState } from 'react';

type Puzzle = { id: string; title: string; time_limit: number; is_active: boolean; attempts: [{ count: number }]; created_at: string };

export default function ManagePuzzles() {
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadPuzzles(); }, []);

    const loadPuzzles = async () => {
        const res = await fetch('/api/puzzle');
        if (res.ok) setPuzzles(await res.json());
        setLoading(false);
    };

    const toggleStatus = async (id: string, current: boolean) => {
        try {
            await fetch(`/api/puzzle/${id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !current })
            });
            loadPuzzles();
        } catch { }
    };

    const deletePuzzle = async (id: string) => {
        if (!confirm('Are you sure you want to delete this puzzle? All associated student attempts will also be deleted.')) return;
        try {
            await fetch(`/api/puzzle/${id}`, { method: 'DELETE' });
            loadPuzzles();
        } catch { }
    };

    return (
        <div className="container dashboard">
            <div className="content-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>📚 Manage Puzzles</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <a href="/teacher/create" className="btn btn-primary">➕ New Puzzle</a>
                        <a href="/teacher/dashboard" className="btn btn-secondary">← Back</a>
                    </div>
                </div>

                {loading ? <p>Loading...</p> : puzzles.length === 0 ? <p>No puzzles found.</p> : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Created</th>
                                    <th>Time Limit</th>
                                    <th>Attempts</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {puzzles.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.title}</td>
                                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
                                        <td>{p.time_limit} mins</td>
                                        <td>{p.attempts[0]?.count || 0}</td>
                                        <td>
                                            <span className={`status-badge ${p.is_active ? 'status-published' : 'status-draft'}`}>
                                                {p.is_active ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button onClick={() => toggleStatus(p.id, p.is_active)} className={`btns action-btn ${p.is_active ? 'unpublish-btn' : 'publish-btn'}`}>
                                                    {p.is_active ? 'Disable' : 'Enable'}
                                                </button>
                                                <button onClick={() => deletePuzzle(p.id)} className="btns action-btn delete-btn">Delete</button>
                                            </div>
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
