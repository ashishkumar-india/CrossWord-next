import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

// GET /api/puzzle/[id]
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const db = createAdminClient();
    const { data, error } = await db
        .from('puzzles')
        .select('id, title, time_limit, grid_size, grid_data, clues_across, clues_down, is_active, teacher_id')
        .eq('id', id)
        .eq('is_active', true)
        .single();

    if (error || !data) return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 });
    return NextResponse.json(data);
}

// PATCH /api/puzzle/[id] — edit title/time_limit/is_active
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const update: Record<string, unknown> = {};
    if (body.title !== undefined) update.title = body.title;
    if (body.time_limit !== undefined) update.time_limit = Number(body.time_limit);
    if (body.is_active !== undefined) update.is_active = Boolean(body.is_active);

    const db = createAdminClient();
    const { error } = await db.from('puzzles').update(update).eq('id', id).eq('teacher_id', user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}

// DELETE /api/puzzle/[id]
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'teacher') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const db = createAdminClient();
    const { error } = await db.from('puzzles').delete().eq('id', id).eq('teacher_id', user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
