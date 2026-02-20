'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentRegister() {
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
            const res = await fetch('/api/auth/student/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Registration failed');

            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => router.push('/auth/student/login'), 2000);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box" style={{ maxWidth: '500px' }}>
                <div className="login-header">
                    <h2>Student Registration</h2>
                </div>
                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" required />
                    </div>
                    <div className="form-group">
                        <label>Email Address (Optional)</label>
                        <input type="email" name="email" />
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
                        <small style={{ color: '#666', display: 'block', marginTop: 5 }}>
                            Min 8 chars, 1 uppercase, 1 number
                        </small>
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input type="password" name="confirm_password" required />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <div style={{ marginTop: 15, textAlign: 'center' }}>
                    <a href="/auth/student/login">Already have an account? Login here</a>
                    <br /><br />
                    <a href="/" style={{ color: '#6b7280' }}>Back to Home</a>
                </div>
            </div>
        </div>
    );
}
