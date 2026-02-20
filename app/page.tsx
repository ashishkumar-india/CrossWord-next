import Link from 'next/link';

export default function Home() {
  return (
    <div className="container dashboard" style={{ marginTop: '10vh' }}>
      <div className="content-box" style={{ textAlign: 'center', padding: '50px 20px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#4f46e5' }}>🧩 Crossword Generator</h1>
        <p style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '40px' }}>
          An interactive platform for teachers to create crosswords and students to solve them.
        </p>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/student/login" className="btn btn-primary" style={{ padding: '15px 30px', fontSize: '1.1rem' }}>
            🎓 I am a Student
          </Link>
          <Link href="/auth/teacher/login" className="btn btn-secondary" style={{ padding: '15px 30px', fontSize: '1.1rem' }}>
            👨‍🏫 I am a Teacher
          </Link>
        </div>
      </div>
    </div>
  );
}
