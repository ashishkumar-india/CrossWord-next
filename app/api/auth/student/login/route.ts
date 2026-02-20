import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase';
import { signStudentToken, STUDENT_COOKIE } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { name, program, password } = await req.json();
        if (!name || !program || !password)
            return NextResponse.json({ error: 'All fields required' }, { status: 400 });

        const db = createAdminClient();
        const { data: student, error } = await db
            .from('students')
            .select('id, name, email, program, password, is_active')
            .eq('name', name)
            .eq('program', program)
            .single();

        // Dummy verify to prevent timing attacks
        if (error || !student) {
            await bcrypt.compare(password, '$2b$10$abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMN');
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, student.password);
        if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        if (!student.is_active) return NextResponse.json({ error: 'Account disabled. Contact your teacher.' }, { status: 403 });

        const token = await signStudentToken({ id: student.id, name: student.name, program: student.program });

        const res = NextResponse.json({ success: true, name: student.name });
        res.cookies.set(STUDENT_COOKIE, token, {
            httpOnly: true, secure: true, sameSite: 'lax', maxAge: 1800, path: '/',
        });
        return res;
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
