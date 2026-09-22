import TeacherAccountForm from '@/components/forms/TeacherAccountForm';
import TeacherProfileForm from '@/components/forms/TeacherProfileForm';
import { useName } from '@/hooks/useName';
import { useStudentAccountFormStore } from '@/store/Student/useStudentAccountFormStore';
import { useComponentsStore } from '@/store/useComponentsStore';
import { useStudentProfileFormStore } from '@/store/Student/useStudentProfileFormStore';
import React, { useEffect, useRef, useState } from 'react'
import { BsChevronLeft } from 'react-icons/bs';
import StudentProfileForm from '@/components/forms/StudentProfileForm';
import StudentAccountForm from '@/components/forms/StudentAccountForm';
import Footer from '@/components/layout/FooterPassword';
import SuccessMessageMobile from '@/components/layout/SucessMessageMobile';
import SuccessMessageDesktop from '@/components/layout/SucessMessageDesktop';

const StudentProfile = () => {
    

    const { isStudentModalOpen, setIsStudentModalOpen } = useComponentsStore()

    const [isValidFirstNameStudent, setIsValidFirstNameStudent] = useState<boolean | null>(null)
    const [isValidLastNameStudent, setIsValidLastNameStudent] = useState<boolean | null>(null)
    const [isValidEmailStudent, setIsValidEmailStudent] = useState<boolean | null>(null)

    const { sucessMessage, setSucessMessage, isStudentMobileMenuOpen, setIsStudentMobileMenuOpen } = useComponentsStore()

    const {
        studentPassword,
        studentNewPassword,
        studentConfirmNewPassword,
        studentEmail,
        setStudentPassword,
        setStudentNewPassword,
        setStudentConfirmNewPassword,
        setStudentEmail
    } = useStudentAccountFormStore()

    const {
        firstNameStudentInput,
        setFirstNameStudentInput,
        lastNameStudentInput,
        setLastNameStudentInput,
        searchStudentTerm,
        setSearchStudentTerm,
    } = useStudentProfileFormStore()

    const [isDisabled, setIsDisabled] = useState(true)
    const [isProfileSelected, setIsProfileSelected] = useState(true)
    const [isAccountSelected, setIsAccountSelected] = useState(false)

    const changeFormSelected = (arg: string) => {



        if (arg === 'profile') {
            setIsProfileSelected(true)
            setIsAccountSelected(false)
            setStudentPassword('')
            setStudentNewPassword('')
            setStudentConfirmNewPassword('')
            setStudentEmail('')
        } else if (arg === 'account') {
            setIsProfileSelected(false)
            setIsAccountSelected(true)
            setFirstNameStudentInput('')
            setLastNameStudentInput('')
            setSearchStudentTerm('')

        }
    }

    const studentProfileFormRef = useRef<HTMLFormElement | null>(null);
    const studentAccountFormRef = useRef<HTMLFormElement | null>(null);

    const validatePassword = (pwd: string) => ({
        isLengthValid: pwd.length >= 6,
        hasUppercase: /[A-Z]/.test(pwd),
        hasSpecialChar: /[!@#$%^&*]/.test(pwd),
    });

    const { isLengthValid, hasUppercase, hasSpecialChar } = validatePassword(studentNewPassword);

    const validating = !studentPassword || !studentNewPassword || !studentConfirmNewPassword
        || !studentEmail || studentNewPassword !== studentConfirmNewPassword
        || !isLengthValid || !hasUppercase || !hasSpecialChar || !firstNameStudentInput
        || !searchStudentTerm || !isValidEmailStudent



    useEffect(() => {
        if (firstNameStudentInput) {
            const NameRegex = /^[A-Z][a-z]+$/
            setIsValidFirstNameStudent(NameRegex.test(firstNameStudentInput));
        } else {
            setIsValidFirstNameStudent(null)
        }
    }, [firstNameStudentInput]);

    useEffect(() => {
        if (lastNameStudentInput) {
            const lastNameRegex = /^[A-Z][a-z]+$/
            setIsValidLastNameStudent(lastNameRegex.test(lastNameStudentInput));
        } else {
            setIsValidLastNameStudent(null)
        }
    }, [lastNameStudentInput]);

    useEffect(() => {
        if (studentEmail) {
            const emailRegex = /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/
            setIsValidEmailStudent(emailRegex.test(studentEmail));
        } else {
            setIsValidEmailStudent(null);
        }
    }, [studentEmail]);


    useEffect(() => {
        if (validating) {
            setIsDisabled(true)
        } else {
            setIsDisabled(false)
        }
    }, [firstNameStudentInput, searchStudentTerm, studentPassword, studentNewPassword,
        studentConfirmNewPassword, studentEmail, isValidEmailStudent])


    useEffect(() => {
        // Ao abrir o modal, bloqueia o scroll do body
        document.body.style.overflow = 'hidden';

        // Ao desmontar o modal, libera o scroll do body
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div className="w-full h-140 bg-white overflow-y-auto z-5 md:h-screen">
            {/* Header */}
            <div className="px-4 pt-4 pb-1 md:ml-10">
                <button
                    onClick={() => setIsStudentModalOpen(false)}
                    className="flex items-center text-sm text-gray-500 hover:underline cursor-pointer"
                >
                    <BsChevronLeft className="h-4 w-4 mr-1" />
                    Voltar
                </button>
                <h1 className="text-2xl md:text-4xl font-semibold text-black">Minha conta</h1>
            </div>

            {/* Conteúdo principal */}
            <section className="flex justify-center items-start px-4 py-10 md:h-screen ">
                <div className="md:w-1/2 max-w-4xl flex flex-col md:flex-row border shadow-lg border-[#E6E6E6] rounded-xl mb-10">

                    {/* Sidebar / Perfil */}
                    <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-[#E6E6E6] p-6 flex flex-col items-center gap-y-8">
                        <div className="relative">
                            <p className="flex items-center justify-center h-20 w-20 rounded-full border-2 border-gray-300 bg-[#FFF4DF] font-medium text-3xl text-blue-dark">
                      E
                            </p>
                            <button className="absolute -bottom-1 -right-1 h-8 w-8 bg-white border border-gray-300 rounded-full text-xl flex items-center justify-center shadow-sm cursor-pointer text-blue-dark">
                                +
                            </button>
                        </div>
                        <div className="flex flex-col gap-y-6 text-sm text-gray-800">
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

                   
                    <div className="flex-1 flex flex-col px-4 py-6">
                        {isProfileSelected && <StudentProfileForm formRef={studentProfileFormRef} />}
                        {isAccountSelected && <StudentAccountForm formRef={studentAccountFormRef} />}

                        <div className="flex flex-col md:flex-row justify-start gap-4 mt-4">
                            <button
                                className={`px-5 py-3 rounded-md font-semibold w-full md:w-auto
                                ${isDisabled
                                        ? "bg-[#E6E6E6] text-gray-500 cursor-not-allowed"
                                        : "bg-[#F57D0B] text-[#333232] cursor-pointer"}`}
                                disabled={isDisabled}
                                onClick={() => {
                                    if (isProfileSelected) {
                                        studentProfileFormRef.current?.requestSubmit();
                                    } else {
                                        studentAccountFormRef.current?.requestSubmit();
                                    }
                                    setSucessMessage(true);
                                }}
                            >
                                Salvar alterações
                            </button>
                            <button className='flex justify-center cursor-pointer text-gray-600 md:hidden '
                                onClick={() => setIsStudentModalOpen(false)}>Cancelar
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
            <Footer /> 
        </div>
    )
}

export default StudentProfile