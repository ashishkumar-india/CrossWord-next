import Navbar from '@/app/components/Navbar';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar role="teacher" />
            {children}
        </>
    );
}
