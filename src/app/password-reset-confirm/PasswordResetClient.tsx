
'use client';

import SidebarPassowdRecovery from '@/components/layout/SidebarPasswordRecovery';
import Footer from '../../components/layout/FooterPassword';
import ResetPassword from '../../components/forms/ResetPassword';

export default function Password_reset() {
    return (
        <section className="max-h-screen flex flex-col font-sans font-semibold">
            <SidebarPassowdRecovery />

            <div className="flex w-full items-center justify-center align-middle h-dvh">
                <ResetPassword />
            </div>

            <footer>
                <Footer />
            </footer>
        </section>
    );
}
