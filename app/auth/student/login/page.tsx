'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentLogin() {
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
            const res = await fetch('/api/auth/student/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Login failed');

            router.push('/student/dashboard');
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h2>Student Login</h2>
                </div>
                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" required />
                    </div>
                    <div className="form-group">
                        <label>Program</label>
                        <select name="program" required>
                            <option value="">Select Program</option>
                            <option value="MSc AI">MSc AI</option>
                            <option value="MSc CS">MSc CS</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" required />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div style={{ marginTop: 15, textAlign: 'center' }}>
                    <a href="/auth/student/register">Register new student</a>
                    <br /><br />
                    <a href="/" style={{ color: '#6b7280' }}>Back to Home</a>
                </div>
            </div>
        </div>
    );
}
