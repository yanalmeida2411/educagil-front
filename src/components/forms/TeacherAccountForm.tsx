'use client'
import { useTeacherAccountFormStore } from '@/store/Teacher/useTeacherAccountFormStore';
import React, { useEffect, useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa';

type Props = {
    formRef: React.RefObject<HTMLFormElement | null>
};

const TeacherAccountForm: React.FC<Props> = ({ formRef }) => {

    const [showNewPassword, setShowNewPassoword] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null)

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

    const validatePassword = (pwd: string) => ({
        isLengthValid: pwd.length >= 6,
        hasUppercase: /[A-Z]/.test(pwd),
        hasSpecialChar: /[!@#$%^&*]/.test(pwd),
    });

    const { isLengthValid, hasUppercase, hasSpecialChar } = validatePassword(newPassword);

    const handleSubmitAccount = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const accountInformation = {
            email: email,
            password: password,
            newPassword: newPassword,
            confirmPassword: confirmPassword
        }
        setPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setEmail('')
    }
    useEffect(() => {
        if (email) {
            const emailRegex = /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/
            setIsValidEmail(emailRegex.test(email));
        } else {
            setIsValidEmail(null);
        }
    }, [email]);

    return (
        <>
            <form className="flex-1 p-6 flex flex-col gap-y-3" ref={formRef} onSubmit={handleSubmitAccount}>
                <div>
                    <label className="text-sm font-medium text-gray-700 ml-3">Email</label>
                    <input
                        type="text"
                        placeholder="Email"
                        className="w-full mt-1 p-3 border border-[#6D6D6D] rounded-md outline-0 focus:border-[#0092BA] text-black"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                {email && !isValidEmail && (
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button id="btnViewPassword" type="button"
                        className="absolute right-3 top-11 cursor-pointer text-black"
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
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button id="btnViewNewPassword" type="button"
                        className="absolute right-3 top-11 cursor-pointer text-black"
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
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button id="btnViewConfirmPassword"
                        type="button"
                        className="absolute right-3 top-11 cursor-pointer text-black"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
            </form>
        </>
    )
}

export default TeacherAccountForm