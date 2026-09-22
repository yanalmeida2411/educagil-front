import TeacherAccountForm from "@/components/forms/TeacherAccountForm";
import TeacherProfileForm from "@/components/forms/TeacherProfileForm";
import { useName } from "@/hooks/useName";
import { useTeacherProfileFormStore } from "@/store/Teacher/useTeacherProfileFormStore";
import { useTeacherAccountFormStore } from "@/store/Teacher/useTeacherAccountFormStore";
import { spec } from "node:test/reporters";
import { useEffect, useRef, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import { useComponentsStore } from "@/store/useComponentsStore";
import Footer from "@/components/layout/FooterPassword";
import SuccessMessageMobile from '@/components/layout/SucessMessageMobile';
import SuccessMessageDesktop from "@/components/layout/SucessMessageDesktop";

const TeacherProfile = () => {
    const {
        fullName
    } = useName();

    const { sucessMessage, setSucessMessage } = useComponentsStore()

    const {
        password,
        newPassword,
        confirmPassword,
        email,
        setPassword,
        setNewPassword,
        setConfirmPassword,
        setEmail
    } = useTeacherAccountFormStore()

    const {
        firstNameInput,
        setFirstNameInput,
        lastNameInput,
        setLastNameInput,
        searchTerm,
        setSearchTerm,
        linkedin,
        setLinkedin,
        team,
        setTeam } = useTeacherProfileFormStore()

    const [isDisabled, setIsDisabled] = useState(true)
    const [isProfileSelected, setIsProfileSelected] = useState(true)
    const [isAccountSelected, setIsAccountSelected] = useState(false)

    const [isValidLinkedin, setIsValidLinkedin] = useState<boolean | null>(null)
    const [isValidFirstName, setIsValidFirstName] = useState<boolean | null>(null)
    const [isValidLastName, setIsValidLastName] = useState<boolean | null>(null)
    const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null)

    const changeFormSelected = (arg: string) => {

        if (arg === 'profile') {
            setIsProfileSelected(true)
            setIsAccountSelected(false)
            setPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setEmail('')
        } else if (arg === 'account') {
            setIsProfileSelected(false)
            setIsAccountSelected(true)
            setFirstNameInput('')
            setLastNameInput('')
            setSearchTerm('')
            setLinkedin('')
            setTeam('')
        }
    }

    const profileFormRef = useRef<HTMLFormElement | null>(null);
    const accountFormRef = useRef<HTMLFormElement | null>(null);

    const validatePassword = (pwd: string) => ({
        isLengthValid: pwd.length >= 6,
        hasUppercase: /[A-Z]/.test(pwd),
        hasSpecialChar: /[!@#$%^&*]/.test(pwd),
    });

    const { isLengthValid, hasUppercase, hasSpecialChar } = validatePassword(newPassword);

    const validating = !password || !newPassword || !confirmPassword || !email || newPassword !== confirmPassword
        || !isLengthValid || !hasUppercase || !hasSpecialChar || !isValidEmail
        

    useEffect(() => {
        if (validating) {
            setIsDisabled(true)
        } else {
            setIsDisabled(false)
        }
    }, [password, newPassword, confirmPassword, email, isValidEmail ])

    useEffect(() => {
        if (linkedin) {
            const linkedinRegex = /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/
            setIsValidLinkedin(linkedinRegex.test(linkedin));
        } else {
            setIsValidLinkedin(null)
        }
    }, [linkedin]);

    useEffect(() => {
        if (firstNameInput) {
            const NameRegex = /^[A-Z][a-z]+$/
            setIsValidFirstName(NameRegex.test(firstNameInput));
        } else {
            setIsValidFirstName(null)
        }
    }, [firstNameInput]);

useEffect(() => {
  if (lastNameInput) {
    const cleanInput = lastNameInput.trim().replace(/\s+/g, ' ');
    const lastNameRegex = /^(?:[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÀÇ][a-záéíóúâêîôûãõàç]*|da|de|do|das|dos)(?: (?:[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÀÇ][a-záéíóúâêîôûãõàç]*|da|de|do|das|dos))*$/;
    setIsValidLastName(lastNameRegex.test(cleanInput));
  } else {
    setIsValidLastName(null);
  }
}, [lastNameInput]);

    useEffect(() => {
        if (!firstNameInput || !lastNameInput || !searchTerm || !linkedin || !isValidLinkedin || !isValidFirstName || !isValidLastName) {
            setIsDisabled(true)
        } else {
            setIsDisabled(false)
        }
    }, [firstNameInput, lastNameInput, searchTerm, linkedin, isValidLinkedin, isValidFirstName, isValidLastName])

    useEffect(() => {
        if (email) {
            const emailRegex = /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/
            setIsValidEmail(emailRegex.test(email));
        } else {
            setIsValidEmail(null);
        }
    }, [email]);

    const { isTeacherModalOpen, setIsTeacherModalOpen } = useComponentsStore()

    useEffect(() => {
        // Ao abrir o modal, bloqueia o scroll do body
        document.body.style.overflow = 'hidden';

        // Ao desmontar o modal, libera o scroll do body
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <>
            <div className="w-full h-150 bg-white overflow-y-auto z-5 md:h-screen">
                {/* Cabeçalho */}
                <div className="px-4 pt-4 pb-1 md:ml-10">
                    <button
                        onClick={() => setIsTeacherModalOpen(false)}
                        className="flex items-center text-sm text-gray-500 hover:underline cursor-pointer"
                    >
                        <BsChevronLeft className="h-4 w-4 mr-1" />
                        Voltar
                    </button>
                    <h1 className="text-2xl md:text-4xl font-semibold text-black ">Minha conta</h1>
                </div>

                {/* Conteúdo principal */}
                <section className="flex justify-center items-start px-4 py-10 md:h-screen">
                    <div className="md:w-1/2 max-w-4xl flex flex-col md:flex-row border shadow-lg border-[#E6E6E6] rounded-xl mb-10">

                        {/* Sidebar */}
                        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-[#E6E6E6] p-6 flex flex-col items-center gap-y-8">
                            <div className="relative">
                                <p className="flex items-center justify-center h-20 w-20 rounded-full border-2 border-gray-300 bg-[#0092BA] text-white font-medium text-3xl">
                                    {fullName ? fullName.charAt(0).toUpperCase() : 'E'}
                                </p>
                                <button className="absolute -bottom-1 -right-1 h-8 w-8 bg-white border border-gray-300 rounded-full text-xl flex items-center justify-center shadow-sm cursor-pointer text-[#0092BA]">
                                    +
                                </button>
                            </div>
                            <div className="w-full flex flex-col gap-y-6 text-sm text-gray-800">
                                <button
                                    onClick={() => changeFormSelected('profile')}
                                    className={`cursor-pointer ${isProfileSelected ? "font-bold" : "font-light"}`}
                                >
                                    Perfil
                                </button>
                                <button
                                    onClick={() => changeFormSelected('account')}
                                    className={`cursor-pointer ${isAccountSelected ? "font-bold" : "font-light"}`}
                                >
                                    Conta
                                </button>
                            </div>
                        </div>

                        {/* Formulário */}
                        <div className="flex-1 flex flex-col px-4 py-6">
                            {isProfileSelected && <TeacherProfileForm formRef={profileFormRef} />}
                            {isAccountSelected && <TeacherAccountForm formRef={accountFormRef} />}

                            <div className="flex flex-col md:flex-row justify-start gap-4 mt-4">
                                <button
                                    className={`px-5 py-3 rounded-md font-semibold w-full md:w-auto
                                        ${isDisabled
                                            ? "bg-[#E6E6E6] text-gray-500 cursor-not-allowed"
                                            : "bg-[#0092BA] text-white cursor-pointer"}`}
                                    disabled={isDisabled}
                                    onClick={() => {
                                        if (isProfileSelected) {
                                            profileFormRef.current?.requestSubmit();
                                        } else {
                                            accountFormRef.current?.requestSubmit();
                                        }
                                        setSucessMessage(true);
                                    }}
                                >
                                    Salvar alterações
                                </button>
                                <button className='flex justify-center cursor-pointer text-gray-600 md:hidden'
                                    onClick={() => setIsTeacherModalOpen(false)}>Cancelar
                                </button>
                            </div>
                            <div className='hidden md:flex'>
                                {sucessMessage && (
                                    <SuccessMessageDesktop
                                        message="Alterações feitas com sucesso"
                                        duration={3000}
                                        onClose={() => setSucessMessage(false)}
                                    />
                                )}
                            </div>
                            <div className='flex md:hidden'>
                                {sucessMessage && (
                                    <SuccessMessageMobile
                                        message="Alterações feitas com sucesso"
                                        duration={3000}
                                        onClose={() => setSucessMessage(false)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                <Footer /> {/* footer invisivel pra nao quebrar */}
            </div>
        </>
    )
}

export default TeacherProfile