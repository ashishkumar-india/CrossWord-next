'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TeacherRegister() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch('/api/auth/teacher/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Registration failed');

            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => router.push('/auth/teacher/login'), 2000);
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
            <div className="glass-card" style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 10 }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📝</div>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--dark)', margin: 0 }}>Teacher Registration</h2>
                    <p style={{ color: 'var(--gray)', fontSize: '0.95rem', marginTop: '5px' }}>Create an account to build puzzles</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {error && <div className="error-message" style={{ margin: 0 }}>{error}</div>}
                    {success && <div className="success-message" style={{ margin: 0 }}>{success}</div>}

                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Full Name</label>
                        <input type="text" name="name" required className="modern-input" placeholder="e.g. Mr. Smith" />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Email Address</label>
                        <input type="email" name="email" required className="modern-input" placeholder="teacher@school.edu" />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Password</label>
                        <input type="password" name="password" required className="modern-input" placeholder="••••••••" />
                        <small style={{ color: 'var(--gray)', display: 'block', marginTop: 4, fontSize: '0.8rem' }}>
                            Min 8 chars, 1 uppercase, 1 number
                        </small>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Confirm Password</label>
                        <input type="password" name="confirm_password" required className="modern-input" placeholder="••••••••" />
                    </div>

                    <button type="submit" disabled={loading} className="btn-modern primary" style={{ width: '100%', padding: '12px', marginTop: '15px', fontSize: '1rem' }}>
                        {loading ? 'Registering...' : 'Create Account'}
                    </button>
                </form>

                <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--gray)' }}>Already have an account? </span>
                    <a href="/auth/teacher/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Login here</a>
                    <br /><br />
                    <a href="/" style={{ color: 'var(--gray)', textDecoration: 'none' }}>&larr; Back to Home</a>
                </div>
            </div>
        </div>
    );
}
