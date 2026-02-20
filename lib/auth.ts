import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'changeme-secret');
const COOKIE_NAME = 'student_session';

export interface StudentPayload {
    id: string;
    name: string;
    program: string;
    role: 'student';
}

export interface TeacherPayload {
    id: string;
    name: string;
    email: string;
    role: 'teacher';
}

// ── Sign a student JWT ─────────────────────────────────────────────────────
export async function signStudentToken(payload: Omit<StudentPayload, 'role'>): Promise<string> {
    return new SignJWT({ ...payload, role: 'student' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30m')
        .sign(JWT_SECRET);
}

// ── Sign a teacher JWT ─────────────────────────────────────────────────────
export async function signTeacherToken(payload: Omit<TeacherPayload, 'role'>): Promise<string> {
    return new SignJWT({ ...payload, role: 'teacher' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30m')
        .sign(JWT_SECRET);
}

// ── Verify any JWT (returns null if invalid/expired) ───────────────────────
export async function verifyToken(token: string): Promise<StudentPayload | TeacherPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as StudentPayload | TeacherPayload;
    } catch {
        return null;
    }
}

// ── Get current user from cookie (server component / API route) ────────────
export async function getCurrentUser(): Promise<StudentPayload | TeacherPayload | null> {
    const cookieStore = await cookies();
    const token =
        cookieStore.get(COOKIE_NAME)?.value ??
        cookieStore.get('teacher_session')?.value;
    if (!token) return null;
    return verifyToken(token);
}

// ── Get token from NextRequest (middleware) ────────────────────────────────
export async function getUserFromRequest(
    req: NextRequest
): Promise<StudentPayload | TeacherPayload | null> {
    const token =
        req.cookies.get(COOKIE_NAME)?.value ??
        req.cookies.get('teacher_session')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export const STUDENT_COOKIE = COOKIE_NAME;
export const TEACHER_COOKIE = 'teacher_session';
