import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase';
import { signTeacherToken, TEACHER_COOKIE } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) return NextResponse.json({ error: 'All fields required' }, { status: 400 });

        const db = createAdminClient();
        const { data: teacher, error } = await db
            .from('teachers')
            .select('id, name, email, password')
            .eq('email', email.toLowerCase())
            .single();

        if (error || !teacher) {
            await bcrypt.compare(password, '$2b$10$abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMN');
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, teacher.password);
        if (!valid) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

        const token = await signTeacherToken({ id: teacher.id, name: teacher.name, email: teacher.email });

        const res = NextResponse.json({ success: true, name: teacher.name });
        res.cookies.set(TEACHER_COOKIE, token, {
            httpOnly: true, secure: true, sameSite: 'lax', maxAge: 1800, path: '/',
        });
        return res;
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
