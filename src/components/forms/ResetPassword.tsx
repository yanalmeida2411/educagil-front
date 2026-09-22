'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from 'axios';

export default function ResetPassword() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();

    const [password, setPassword] = useState('');
    
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const validatePassword = (pwd: string) => ({
        isLengthValid: pwd.length >= 6,
        hasUppercase: /[A-Z]/.test(pwd),
        hasSpecialChar: /[!@#$%^&*]/.test(pwd),
    });

    const { isLengthValid, hasUppercase, hasSpecialChar } = validatePassword(password);
    const isMatching = confirmPassword.length > 0 && confirmPassword === password;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setErrorMessage('Token não encontrado.');
            return;
        }
        setIsLoading(true);

        try {
            const response = await axios.post(
                "https://back-educagil.onrender.com/password-reset-confirm/",
                {
                    token: token,
                    new_password: password.trim(),
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                }
            );

            setSuccess(true);
            setErrorMessage('');
            setPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                router.push('/login');
            }, 5000);
        } catch (err: any) {
            const mensagem =
                err?.response?.data?.detail ||
                err?.message ||
                'Erro ao redefinir a senha. Verifique os dados e tente novamente.';
            setErrorMessage(mensagem);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className='flex justify-start items-start'>
            <div className='flex flex-col justify-center items-center'>
                <img
                    src="assets/svg/recovery.svg"
                    alt="Ilustração de redefinição de senha"
                    className='block max-md:hidden'
                />

                <form
                    onSubmit={handleSubmit}
                    className='text-[#161616] flex flex-col items-start max-md:items-start gap-[24px]'
                >
                    <div className='flex flex-col items-center max-md:items-start gap-[16px]'>
                        <h2 className='text-[28px] max-md:text-[26px]'>Redefine sua senha</h2>
                        <p className="font-normal text-center max-md:text-start max-md:text-[16px] max-md:w-70">
                            Crie uma nova senha forte para proteger sua conta.
                        </p>
                    </div>

                    <div className='flex flex-col max-md:items-start gap-[4px] w-full'>
                        <label htmlFor="password">Nova senha</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder='● ● ● ● ● ●'
                                autoComplete="new-password"
                                className='w-full p-[16px] py-[12px] border-2 border-[#6D6D6D] rounded-lg'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                id='seePasswordButton'
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                tabIndex={-1}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        <ul className='text-sm text-[#6D6D6D] list-disc ml-5 mt-1'>
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

                    <div className='flex flex-col max-md:items-start gap-[4px] w-full'>
                        <label htmlFor="confirmPassword">Confirmar senha</label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder='● ● ● ● ● ●'
                                autoComplete="new-password"
                                className='w-full p-[16px] py-[12px] border-2 border-[#6D6D6D] rounded-lg'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                id='seeConfirmPasswordButton'
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    {errorMessage && (
                        <div id='textErrorReset' className="w-full p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg text-center mb-4">
                            {errorMessage}
                        </div>
                    )}

                    {success && (
                        <div id='textSuccessReset'  className="w-full p-4 text-green-700 bg-green-100 border border-green-400 rounded-lg text-center">
                            🎉 Parabéns! Senha redefinida com sucesso.
                        </div>
                    )}

                    <button
                        type="submit"
                        id='btnSubmit'
                        disabled={isLoading || !isLengthValid || !hasUppercase || !hasSpecialChar || !isMatching}
                        className={`w-full p-[16px] py-[12px] rounded-lg transition-colors max-md:mt-[100px]
                            ${isLengthValid && hasUppercase && hasSpecialChar && isMatching && !isLoading
                                ? "bg-[#161616] text-[#FFFFFF] cursor-pointer"
                                : "bg-[#E6E6E6] text-[#A0A0A0] cursor-not-allowed"}`}
                    >
                        {isLoading ? 'Carregando...' : 'Confirmar'}
                    </button>
                </form>
            </div>
        </section>
    );
}
