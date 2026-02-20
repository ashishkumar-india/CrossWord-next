import Navbar from '@/app/components/Navbar';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar role="teacher" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
        </div>
    );
}
