import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GrHomeRounded } from 'react-icons/gr'
import { RiGraduationCapLine } from 'react-icons/ri'
import { MdOutlineChat, MdNotificationsNone } from 'react-icons/md'
import { IoLogOutOutline } from 'react-icons/io5'
import { IoClose } from 'react-icons/io5'
import { useName } from '@/hooks/useName';
import { useLogout } from '@/hooks/useLogout';
import { useComponentsStore } from '@/store/useComponentsStore';
import StudentProfile from '@/components/ui/Student/StudentProfile';
import { useUserInfoFromCookies } from '@/hooks/useUserFromCookies';
import { destroyCookie } from 'nookies';
import { useRouter } from 'next/navigation';

export default function SidebarStudent() {
    const { full_name } = useUserInfoFromCookies();
    const { isStudentModalOpen, setIsStudentModalOpen, isStudentMobileMenuOpen, setIsStudentMobileMenuOpen } = useComponentsStore()
    const pathname = usePathname()
    const router = useRouter();
    const links = [
        { id: 'iconHome', href: '/', label: 'Home', icon: <GrHomeRounded className="w-5 h-5" /> },
        { id: 'iconClasses', href: '/classes', label: 'Minhas aulas', icon: <RiGraduationCapLine className="w-5 h-5" /> },
        { id: 'iconCommunity', href: '/community', label: 'Comunidade', icon: <MdOutlineChat className="w-5 h-5" /> },
    ]

    const switchPages = () => {
        if (isStudentMobileMenuOpen && !isStudentModalOpen) {
            setIsStudentMobileMenuOpen(false)
            setIsStudentModalOpen(true)
        }
        if (isStudentMobileMenuOpen && isStudentModalOpen) {
            setIsStudentMobileMenuOpen(false)
            setIsStudentModalOpen(false)
        }
    }

    function signOut() {
        try {
            destroyCookie(null, '@educagil.token', { path: '/' });
            router.push('/login');
        } catch (err) {
            console.error('Erro ao deslogar usuário:', err);
        }
    }

    return (
        <>
            <header className="bg-white shadow flex items-center justify-between px-8 py-4 max-md:px-4 relative">
                <div className="flex-shrink-0">
                    <img
                        src="assets/svg/educAgilPrafessores.svg"
                        alt="Logo Alunos EducAgil"
                        className="w-32 hidden md:block"
                    />

                    <img
                        src="assets/svg/educAgilPrafessoresMini.svg"
                        alt="Logo mobile"
                        className="w-20 md:hidden "
                    />
                </div>


                <nav className="hidden md:flex gap-8">
                    {links.map(({ id, href, label, icon }) => {
                        const isActive = pathname === href
                        return (
                            <Link

                                key={href}
                                id={id}
                                href={href}
                                className={`
                                        flex flex-col items-center justify-center p-2
                                        ${isActive ? 'text-blue font-semibold' : 'text-gray'}
                                       
                                    `}
                            >
                                {icon}
                                <span className="text-sm mt-1">{label}</span>
                            </Link>
                        )
                    })}
                </nav>


                <div className="hidden md:flex items-center gap-6">
                    <div className="flex items-center gap-3 cursor-pointer "
                        onClick={() => setIsStudentModalOpen(!isStudentModalOpen)}>
                        <p className="flex items-center justify-center h-10 w-10 rounded-full background-blue-dark text-white font-medium">
                            {full_name ? full_name.charAt(0).toUpperCase() : 'E'}
                        </p>
                        <p className="whitespace-nowrap font-medium text-gray ">{full_name || 'EducaAgil'}</p>
                    </div>
                    <div className="flex items-center gap-4 text-[#6D6D6D] cursor-pointer">
                        <MdNotificationsNone id='returnLoginDesktop' className="w-6 h-6 " />
                        <Link
                            href="/login">
                            <IoLogOutOutline onClick={() => signOut()} className="w-6 h-6 hover:text-[#DE3B40]" />
                        </Link>
                    </div>

                </div>

                <div className="flex md:hidden items-center gap-4">
                    <MdNotificationsNone className="w-6 h-6 text-[#6D6D6D]" />
                    <button onClick={() => setIsStudentMobileMenuOpen(true)} className="p-1">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
                {isStudentMobileMenuOpen && (
                    <div className="fixed top-0 left-0 w-full h-full bg-white z-50 flex flex-col px-6 py-6 animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <img src="assets/svg/educAgilProfessoresMini.svg" alt="Logo" className="w-20" />
                            <button onClick={() => setIsStudentMobileMenuOpen(false)} className="text-2xl text-gray-700 cursor-pointer">
                                <IoClose />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 mb-4 cursor-pointer"
                            onClick={() => {
                                setIsStudentMobileMenuOpen(false)
                                setIsStudentModalOpen(true)
                            }}>
                            <p className="flex items-center justify-center h-10 w-10 rounded-full text-white font-medium">
                                {full_name ? full_name.charAt(0).toUpperCase() : 'E'}
                            </p>
                            <p className="text-[#333] font-medium">{full_name || 'Educagil'}</p>
                        </div>

                        <div className="flex flex-col gap-2 border-t pt-4">
                            {links.map(({ id, href, label, icon }) => {
                                const isActive = pathname === href
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        id={id}
                                        className={`flex items-center gap-3 p-3 rounded-md ${isActive ? 'bg-[#E8F8FC] ' : 'bg-white text-[#444]'
                                            } border hover:bg-[#E8F8FC] transition-all`}
                                        onClick={() => {
                                            setIsStudentModalOpen(false)
                                            setIsStudentMobileMenuOpen(false)
                                        }}
                                    >
                                        {icon}
                                        <span className="text-sm">{label}</span>
                                    </Link>
                                )
                            })}
                        </div>

                        <Link
                            href="/login"
                            className="mt-6 text-sm text-[#DE3B40] flex items-center gap-2"
                        >
                            <IoLogOutOutline
                                onClick={() => signOut()}
                                id='returnLoginMobile'
                                className="w-5 h-5" />
                            Sair
                        </Link>
                    </div>
                )}
            </header>
            {isStudentModalOpen && <StudentProfile />}

        </>
    )
}