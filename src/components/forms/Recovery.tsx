'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';


export default function Recovery() {
    const [email, setEmail] = useState<string>('');
    const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);
    const [isEmailSuccess, setIsEmailSuccess] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [successMessageReenvio, setSuccessMessageReenvio] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);

        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        setIsValidEmail(isValid);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'https://back-educagil.onrender.com/password-reset/',
                { email },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                }
            );

            if (response && response.status === 200) {
                setSuccessMessage(
                    "E-mail de recuperação enviado! Verifique sua caixa de entrada. Por favor, não esqueça de verificar também a caixa de spam."
                );
                setIsEmailSuccess(true)
            } else {

            }
        } catch (err: any) {
            const extractFirstError = (data: any): string | null => {
                if (typeof data !== 'object' || data === null) return null;
                for (const key in data) {
                    if (Array.isArray(data[key]) && data[key].length > 0) {
                        return data[key][0];
                    }
                    if (typeof data[key] === 'object') {
                        const nestedError = extractFirstError(data[key]);
                        if (nestedError) return nestedError;
                    }
                }
                return null;
            };

            const msg =
                err?.response?.data?.detail
            err?.response?.data?.message
            extractFirstError(err?.response?.data)
            "Erro inesperado no servidor. Tente novamente mais tarde.";
            setError(msg);
        }

    };

    const handleResend = async () => {
        if (!isValidEmail) return;
        setSuccessMessage(null);
        try {
            const response = await axios.post(
                'https://back-educagil.onrender.com/password-reset/',
                { email },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                }
            );

            if (response && response.status === 200) {
                setSuccessMessageReenvio(
                    "Reenvio realizado com sucesso! Verifique novamente sua caixa de entrada e não esqueça de verificar também a caixa de spam."
                );
            }
        } catch (err: any) {
            const extractFirstError = (data: any): string | null => {
                if (typeof data !== 'object' || data === null) return null;
                for (const key in data) {
                    if (Array.isArray(data[key]) && data[key].length > 0) {
                        return data[key][0];
                    }
                    if (typeof data[key] === 'object') {
                        const nestedError = extractFirstError(data[key]);
                        if (nestedError) return nestedError;
                    }
                }
                return null;
            };

            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                extractFirstError(err?.response?.data) ||
                "Erro inesperado no servidor. Tente novamente mais tarde.";
            setError(msg);
        }
    };

    return (
        <section className='flex justify-start items-start'>
            <div className='flex flex-col justify-center items-center'>
                <img src="assets/svg/emailRecovery.svg"
                    alt="Recuperar Senha"
                    className='block max-md:hidden' />
                <form onSubmit={handleSubmit}
                    className='text-[#161616] flex flex-col items-center max-md:items-start gap-[24px]'>
                    <h2 className='text-[28px] max-md:text-[26px]'>Esqueceu a senha?</h2>
                    <p className="w-80 font-normal text-center max-md:text-start max-md:text-[16px] max-md:w-70">Sem problemas! Insira seu email e enviaremos um link para recriar sua senha</p>

                    <input id="emailRecovery"
                        type="email"
                        placeholder='Insira seu email'
                        className={`w-full gap-4 p-[16px] py-[12px] border-2 
                    border-[#6D6D6D] rounded-lg ${isValidEmail === null
                                ? "border-gray-300"
                                : isValidEmail
                                    ? "border-green-500"
                                    : "border-red-500"
                            }`}
                        value={email}
                        onChange={handleEmailChange} />
                    {email && !isValidEmail && (
                        <p id='emailInvalidEmail' className="text-xs text-red-600">
                            Por favor, insira um e-mail válido
                        </p>
                    )}
                    {error && <p id='emailErrorEmail' className="w-80 text-red-600 text-sm font-medium bg-red-100 border border-red-300 rounded p-2">{error}</p>}
                    {successMessage && <p id='emailSuccessMessageEmail' className="w-80 text-center text-green-700 text-sm font-semibold bg-green-100 border border-green-400 rounded p-3">{successMessage}</p>}
                    {successMessageReenvio && <p id='emailSuccessMessageReenvioEmail' className="w-80 text-center text-green-700 text-sm font-semibold bg-green-100 border border-green-400 rounded p-3">{successMessageReenvio}</p>}
                    <button
                        id="btnSubmitRecovery"
                        disabled={!isValidEmail || isEmailSuccess}
                        type="submit"
                        className={`w-full p-[16px] py-[12px] rounded-lg transition-colors order-1 max-md:order-2 max-md:mt-[200px]
                                    ${isEmailSuccess
                                ? "bg-[#E6E6E6] text-[#A0A0A0] cursor-not-allowed"
                                : isValidEmail
                                    ? "bg-[#161616] text-[#FFFFFF] cursor-pointer"
                                    : "bg-[#E6E6E6] text-[#A0A0A0] cursor-not-allowed"
                            }`}
                    >
                        {isEmailSuccess ? "Enviado" : "Enviar"}
                    </button>
                    {isEmailSuccess && (
                        <p className='font-light order-2 max-md:order-1'>
                            Não recebeu o email? <Link
                                href="#"
                                className="font-semibold"
                            >
                                <button
                                    id='btnResendEmail'
                                    onClick={handleResend}
                                    className={`font-semibold ml-1 transition-colors  text-[#6D6D6D] 
                                            ${isValidEmail ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                                >
                                    Envie novamente
                                </button>
                            </Link>
                        </p>
                    )}
                </form>
            </div>
        </section>
    );
}
