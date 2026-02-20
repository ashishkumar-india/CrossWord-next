'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function StudentActions({ studentId, isActive }: { studentId: string; isActive: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const toggleStatus = async () => {
        setLoading(true);
        await fetch('/api/teacher/manage', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'toggle_student', student_id: studentId, toggle_action: isActive ? 0 : 1 })
        });
        router.refresh();
        setLoading(false);
    };

    const deleteStudent = async () => {
        if (!confirm('Delete this student? This action cannot be undone.')) return;
        setLoading(true);
        await fetch('/api/teacher/manage', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete_student', student_id: studentId })
        });
        router.refresh();
        setLoading(false);
    };

    return (
        <div className="action-buttons">
            <button onClick={toggleStatus} disabled={loading} className={`btns action-btn ${isActive ? 'unpublish-btn' : 'publish-btn'}`}>
                {isActive ? 'Disable' : 'Enable'}
            </button>
            <button onClick={deleteStudent} disabled={loading} className="btns action-btn delete-btn">Delete</button>
        </div>
    );
}
