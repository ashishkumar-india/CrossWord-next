import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const studentPath = pathname.startsWith('/student');
    const teacherPath = pathname.startsWith('/teacher');

    if (!studentPath && !teacherPath) return NextResponse.next();

    const user = await getUserFromRequest(req);

    if (!user) {
        const loginUrl = studentPath ? '/auth/student/login' : '/auth/teacher/login';
        return NextResponse.redirect(new URL(loginUrl, req.url));
    }

    // Role mismatch
    if (studentPath && user.role !== 'student') {
        return NextResponse.redirect(new URL('/auth/student/login', req.url));
    }
    if (teacherPath && user.role !== 'teacher') {
        return NextResponse.redirect(new URL('/auth/teacher/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/student/:path*', '/teacher/:path*'],
};
