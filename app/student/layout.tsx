import Navbar from '@/app/components/Navbar';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar role="student" />
            {children}
        </>
    );
}
