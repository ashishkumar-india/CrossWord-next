import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { name, email, password, confirm_password } = await req.json();
        if (!name || !email || !password || !confirm_password)
            return NextResponse.json({ error: 'All fields required' }, { status: 400 });
        if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        if (!/[A-Z]/.test(password)) return NextResponse.json({ error: 'Password must contain an uppercase letter' }, { status: 400 });
        if (!/[0-9]/.test(password)) return NextResponse.json({ error: 'Password must contain a number' }, { status: 400 });
        if (password !== confirm_password) return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });

        const db = createAdminClient();
        const { data: existing } = await db.from('teachers').select('id').eq('email', email.toLowerCase()).single();
        if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

        const hashedPassword = await bcrypt.hash(password, 12);
        const { error } = await db.from('teachers').insert({ name, email: email.toLowerCase(), password: hashedPassword });
        if (error) {
            console.error('Supabase Teacher Insert Error DEBUG:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return NextResponse.json({
                error: 'Registration failed',
                debug: error.message
            }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Registration Catch Error:', err);
        return NextResponse.json({
            error: 'Server error',
            debug: err.message,
            stack: err.stack
        }, { status: 500 });
    }
}
