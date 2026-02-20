'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AttemptActions({ attemptId, isPublished, isLocked, isCompleted }: { attemptId: string; isPublished: boolean; isLocked: boolean; isCompleted: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleAction = async (action: string) => {
        let confirmMsg = '';
        if (action === 'unlock_attempt') confirmMsg = 'Unlock this puzzle for retry?';
        if (action === 'publish_attempt') confirmMsg = 'Publish this result?';
        if (action === 'unpublish_attempt') confirmMsg = 'Hide this result?';

        if (confirmMsg && !confirm(confirmMsg)) return;

        setLoading(true);
        await fetch('/api/teacher/manage', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, attempt_id: attemptId })
        });
        router.refresh();
        setLoading(false);
    };

    return (
        <div className="action-buttons">
            {isLocked && (
                <button onClick={() => handleAction('unlock_attempt')} disabled={loading} className="btns action-btn unlock-btn">
                    🔓 Unlock
                </button>
            )}
            {isCompleted && (
                isPublished ? (
                    <button onClick={() => handleAction('unpublish_attempt')} disabled={loading} className="btns action-btn unpublish-btn">
                        🔒 Hide
                    </button>
                ) : (
                    <button onClick={() => handleAction('publish_attempt')} disabled={loading} className="btns action-btn publish-btn">
                        👁️ Publish
                    </button>
                )
            )}
        </div>
    );
}
