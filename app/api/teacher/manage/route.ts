import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

// POST /api/teacher/manage
// action: 'toggle_student' | 'delete_student' | 'publish_attempt' | 'unpublish_attempt' | 'unlock_attempt'
export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, student_id, attempt_id, toggle_action } = await req.json();
    const db = createAdminClient();

    try {
        if (action === 'toggle_student' && student_id) {
            const { error } = await db.from('students').update({ is_active: toggle_action === 1 }).eq('id', student_id);
            if (error) throw error;
            return NextResponse.json({ success: true, message: `Student ${toggle_action === 1 ? 'enabled' : 'disabled'}` });
        }

        if (action === 'delete_student' && student_id) {
            const { error } = await db.from('students').delete().eq('id', student_id);
            if (error) throw error;
            return NextResponse.json({ success: true, message: 'Student deleted' });
        }

        if (action === 'publish_attempt' && attempt_id) {
            // Need to verify puzzle belongs to teacher
            const { data: attempt } = await db.from('attempts').select('puzzles(teacher_id)').eq('id', attempt_id).single();
            if ((attempt?.puzzles as any)?.teacher_id !== user.id) throw new Error('Unauthorized');

            const { error } = await db.from('attempts').update({ result_published: true }).eq('id', attempt_id);
            if (error) throw error;
            return NextResponse.json({ success: true, message: 'Result published' });
        }

        if (action === 'unpublish_attempt' && attempt_id) {
            const { data: attempt } = await db.from('attempts').select('puzzles(teacher_id)').eq('id', attempt_id).single();
            if ((attempt?.puzzles as any)?.teacher_id !== user.id) throw new Error('Unauthorized');

            const { error } = await db.from('attempts').update({ result_published: false }).eq('id', attempt_id);
            if (error) throw error;
            return NextResponse.json({ success: true, message: 'Result hidden' });
        }

        if (action === 'unlock_attempt' && attempt_id) {
            const { data: attempt } = await db.from('attempts').select('puzzles(teacher_id)').eq('id', attempt_id).single();
            if ((attempt?.puzzles as any)?.teacher_id !== user.id) throw new Error('Unauthorized');

            const { error } = await db.from('attempts').update({ locked: false }).eq('id', attempt_id);
            if (error) throw error;
            return NextResponse.json({ success: true, message: 'Puzzle unlocked' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
