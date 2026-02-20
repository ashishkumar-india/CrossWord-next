"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        top: '-100px',
        left: '-100px',
        filter: 'blur(30px)'
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.05)',
        bottom: '-150px',
        right: '-100px',
        filter: 'blur(50px)'
      }} />

      <div className="auth-box" style={{
        maxWidth: '800px',
        textAlign: 'center',
        padding: '60px 40px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            fontSize: '5rem',
            marginBottom: '20px',
            display: 'inline-block',
            animation: 'bounce 2s infinite'
          }}>🧩</div>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            marginBottom: '15px',
            background: 'linear-gradient(to right, #4f46e5, #9333ea)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            Crossword Master
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#4b5563',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            The ultra-modern platform for creating, sharing, and solving educational crossword puzzles.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginTop: '40px'
        }}>
          <Link href="/auth/student/login" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '30px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)',
              textAlign: 'center'
            }} className="hover-lift">
              <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🎓</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Student Portal</h3>
              <p style={{ fontSize: '0.95rem', opacity: '0.9' }}>Join as a student to solve puzzles assigned by your teachers.</p>
            </div>
          </Link>

          <Link href="/auth/teacher/login" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '30px',
              borderRadius: '20px',
              background: 'white',
              color: '#1f2937',
              border: '2px solid #e5e7eb',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }} className="hover-lift-white">
              <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>👨‍🏫</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Teacher Dashboard</h3>
              <p style={{ fontSize: '0.95rem', color: '#6b7280' }}>Manage students, create puzzles, and track results effortlessly.</p>
            </div>
          </Link>
        </div>

        <style jsx>{`
          .hover-lift:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.5);
          }
          .hover-lift-white:hover {
            transform: translateY(-8px);
            border-color: #4f46e5;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    </main>
  );
}
