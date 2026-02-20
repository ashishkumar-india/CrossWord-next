export default function Footer() {
    return (
        <footer style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: 'rgba(255, 255, 255, 0.7)',
            padding: '40px 20px 24px',
            marginTop: 'auto',
            borderTop: '1px solid rgba(99, 102, 241, 0.2)',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '30px',
            }}>
                {/* Brand */}
                <div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>
                        🧩 Crossword Master
                    </div>
                    <p style={{ fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                        The interactive educational platform for creating, sharing, and solving crossword puzzles.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={{ color: '#a5b4fc', fontSize: '0.9rem', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Quick Links
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                        <a href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s' }}>Home</a>
                        <a href="/auth/student/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Student Login</a>
                        <a href="/auth/teacher/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Teacher Login</a>
                    </div>
                </div>

                {/* Features */}
                <div>
                    <h4 style={{ color: '#a5b4fc', fontSize: '0.9rem', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Features
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                        <span>📝 Create Puzzles</span>
                        <span>⏱️ Timed Challenges</span>
                        <span>📊 Score Tracking</span>
                        <span>🔒 Secure Platform</span>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{
                maxWidth: '1200px',
                margin: '30px auto 0',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                fontSize: '0.8rem',
            }}>
                <span>© {new Date().getFullYear()} Crossword Master. All rights reserved.</span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Built with ❤️ using Next.js & Supabase</span>
            </div>
        </footer>
    );
}
