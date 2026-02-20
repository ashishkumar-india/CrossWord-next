import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { name, email, program, password, confirm_password } = await req.json();

        if (!name || !program || !password || !confirm_password)
            return NextResponse.json({ error: 'All fields required' }, { status: 400 });
        if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        if (!/[A-Z]/.test(password)) return NextResponse.json({ error: 'Password must contain an uppercase letter' }, { status: 400 });
        if (!/[0-9]/.test(password)) return NextResponse.json({ error: 'Password must contain a number' }, { status: 400 });
        if (password !== confirm_password) return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });

        const db = createAdminClient();

        // Check duplicate
        const { data: existing } = await db.from('students').select('id').eq('name', name).eq('program', program).single();
        if (existing) return NextResponse.json({ error: 'A student with this name and program already exists' }, { status: 409 });

        const hashedPassword = await bcrypt.hash(password, 12);
        const { error } = await db.from('students').insert({ name, email: email || null, program, password: hashedPassword });

        if (error) return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
