'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavbarProps {
    role: 'student' | 'teacher';
}

export default function Navbar({ role }: NavbarProps) {
    const router = useRouter();

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
    };

    return (
        <div className="navbar">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>🧩 Crossword Game</h1>
                <nav style={{ display: 'flex', gap: '15px' }}>
                    {role === 'student' ? (
                        <>
                            <Link href="/student/dashboard">Dashboard</Link>
                            <Link href="/student/results">My Results</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/teacher/dashboard">Dashboard</Link>
                            <Link href="/teacher/create">Create Puzzle</Link>
                            <Link href="/teacher/puzzles">Manage Puzzles</Link>
                            <Link href="/teacher/students">Students</Link>
                            <Link href="/teacher/results">Results</Link>
                            <Link href="/teacher/logs">Logs</Link>
                        </>
                    )}
                    <a href="#" onClick={handleLogout}>Logout</a>
                </nav>
            </div>
        </div>
    );
}
