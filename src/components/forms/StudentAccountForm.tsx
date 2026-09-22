import { useRegister } from '@/hooks/useRegister';
import { useStudentAccountFormStore } from '@/store/Student/useStudentAccountFormStore';
import React, { RefObject, useEffect, useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa';

type Props = {
    formRef: React.RefObject<HTMLFormElement | null>
};

const StudentAccountForm: React.FC<Props> = ({ formRef }) => {

    const [showNewPassword, setShowNewPassoword] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [isValidEmailStudent, setIsValidEmailStudent] = useState<boolean | null>(null)

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

    const validatePassword = (pwd: string) => ({
        isLengthValid: pwd.length >= 6,
        hasUppercase: /[A-Z]/.test(pwd),
        hasSpecialChar: /[!@#$%^&*]/.test(pwd),
    });

    const { isLengthValid, hasUppercase, hasSpecialChar } = validatePassword(studentNewPassword);

    const handleSubmitAccount = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const studentAccountInformation = {
            email: studentEmail,
            password: studentPassword,
            newPassword: studentNewPassword,
            confirmPassword: studentConfirmNewPassword
        }
        setStudentPassword('')
        setStudentNewPassword('')
        setStudentConfirmNewPassword('')
        setStudentEmail('')
    }
    useEffect(() => {
            if (studentEmail) {
                const emailRegex = /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/
                setIsValidEmailStudent(emailRegex.test(studentEmail));
            } else {
                setIsValidEmailStudent(null);
            }
        }, [studentEmail]);

    return (
        <>
            <form className="flex-1 p-6 flex flex-col gap-y-3" ref={formRef} onSubmit={handleSubmitAccount}>
                <div>
                    <label className="text-sm font-medium text-gray-700 ml-3">Email</label>
                    <input
                        type="text"
                        placeholder="Email"
                        className="w-full mt-1 p-3 border border-[#6D6D6D] rounded-md outline-0 focus:border-[#0092BA] text-black"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                    />
                </div>
                {studentEmail && !isValidEmailStudent && (
                    <p id="emailInvalidLogin" className="text-xs text-red-600 mt-1">
                        Por favor, insira um email válido
                    </p>
                )}

                <div className='relative'>
                    <label className="text-sm font-medium text-gray-700 ml-3">Senha Atual</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className=" w-full mt-1 p-3 border border-[#6D6D6D] rounded-md outline-0 focus:border-[#0092BA] text-black"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                    />
                    <button id="btnViewPassword" type="button"
                        className="absolute right-3 top-11 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                <div className='relative'>
                    <label className="text-sm font-medium text-gray-700 ml-3">Nova senha</label>
                    <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full mt-1 p-3 border border-[#6D6D6D] rounded-md outline-0 focus:border-[#0092BA] text-black"
                        value={studentNewPassword}
                        onChange={(e) => setStudentNewPassword(e.target.value)}
                    />
                    <button id="btnViewNewPassword" type="button"
                        className="absolute right-3 top-11 cursor-pointer"
                        onClick={() => setShowNewPassoword(!showNewPassword)}>
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <ul className='text-[11px] md:text-sm text-[#6D6D6D] list-disc ml-5 mt-1'>
                        <li className={isLengthValid ? 'line-through text-green-600' : ''}>
                            Deve conter pelo menos 6 dígitos
                        </li>
                        <li className={hasUppercase ? 'line-through text-green-600' : ''}>
                            1 letra maiúscula
                        </li>
                        <li className={hasSpecialChar ? 'line-through text-green-600' : ''}>
                            1 caractere especial (ex: ! @ # $ % ^ & *)
                        </li>
                    </ul>
                </div>

                <div className='relative'>
                    <label className="w-full text-sm font-medium text-gray-700 ml-3">Confirmar Senha</label>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full mt-1 p-3 border border-[#6D6D6D] rounded-md outline-0 focus:border-[#0092BA] text-black"
                        value={studentConfirmNewPassword}
                        onChange={(e) => setStudentConfirmNewPassword(e.target.value)}
                    />
                    <button id="btnViewConfirmPassword"
                        type="button"
                        className="absolute right-3 top-11 cursor-pointer"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
            </form>
        </>
    )
}

export default StudentAccountForm;