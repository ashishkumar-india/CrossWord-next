'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TeacherLogin() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch('/api/auth/teacher/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Login failed');

            router.push('/teacher/dashboard');
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative'
        }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👨‍🏫</div>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--dark)', margin: 0 }}>Teacher Access</h2>
                    <p style={{ color: 'var(--gray)', fontSize: '0.95rem', marginTop: '5px' }}>Sign in to manage your classes</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {error && <div className="error-message" style={{ margin: 0 }}>{error}</div>}

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Email Address</label>
                        <input type="email" name="email" required className="modern-input" placeholder="teacher@school.edu" />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Password</label>
                        <input type="password" name="password" required className="modern-input" placeholder="••••••••" />
                    </div>

                    <button type="submit" disabled={loading} className="btn-modern primary" style={{ width: '100%', padding: '12px', marginTop: '10px', fontSize: '1rem' }}>
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem' }}>
                    <a href="/auth/teacher/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Register new teacher account</a>
                    <br /><br />
                    <a href="/" style={{ color: 'var(--gray)', textDecoration: 'none' }}>&larr; Back to Home</a>
                </div>
            </div>
        </div>
    );
}
