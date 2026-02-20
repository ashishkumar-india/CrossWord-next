import { NextResponse } from 'next/server';
import { STUDENT_COOKIE, TEACHER_COOKIE } from '@/lib/auth';

export async function POST() {
    const res = NextResponse.json({ success: true });
    res.cookies.set(STUDENT_COOKIE, '', { maxAge: 0, path: '/' });
    res.cookies.set(TEACHER_COOKIE, '', { maxAge: 0, path: '/' });
    return res;
}
