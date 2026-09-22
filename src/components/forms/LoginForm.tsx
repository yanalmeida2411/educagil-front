'use client'
import { useLogin } from '@/hooks/useLogin';
import Link from 'next/link';
import React, { useEffect } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6';

const LoginForm = () => {
    
    const {
        email,
        setEmail,
        password,
        setPassword,
        isValidEmail,
        showPassword,
        setShowPassword,
        loading,
        errorMessage,
        handleLogin,
        setIsValidEmail
    } = useLogin();

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
            <div className="bg-white p-5 sm:p-6 md:p-8 sm:rounded-lg sm:border sm:shadow-sm sm:shadow-[#B0B0B0] sm:border-[#E6E6E6] text-[#333232]">
                <h2 className="text-2xl font-semibold mb-4">
                    Faça seu Login!
                </h2>

             <form onSubmit={(e) => handleLogin(e)} className="flex flex-col space-y-4">
                    <div>
                        <label className="pl-2 block text-base font-semibold text-[#6D6D6D] mb-1">
                            Email
                        </label>
                        <input
                            id="emailLogin"
                            type="email"
                            placeholder="pipoca@email.com"
                            className={`w-full p-2.5 sm:p-3 border rounded-md text-gray-900 bg-white ${isValidEmail === null
                                ? "border-gray-300"
                                : isValidEmail
                                    ? "border-green-500"
                                    : "border-red-500"
                                }`}
                            value={email.toLowerCase()} //SEMPRE MINUSCULO NO EMAIL DO LOGIN
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                        {email && !isValidEmail && (
                            <p id="emailInvalidLogin" className="text-xs text-red-600 mt-1">
                                Por favor, insira um e-mail válido
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="pl-2 block text-base font-semibold text-[#6D6D6D] mb-1">
                            Senha
                        </label>
                        <div className="relative">
                            <input
                                id="passwordLogin"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full p-2 sm:p-3 border rounded-md text-[#161616] bg-white border-gray-300"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                id="btnViewPassword"
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#161616] cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        <Link
                            href="/email_password_recovery"
                            className="text-sm text-[#6D6D6D] underline mt-4 block"
                        >
                            Esqueci a senha
                        </Link>
                    </div>

                    {errorMessage && (
                        <div id="textErrorLogin" className="text-red-600 text-sm font-medium bg-red-100 border border-red-300 rounded p-2">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        id="btnSubmit"
                        type="submit"
                        disabled={loading}
                        className={`w-full text-white text-sm font-medium py-2 sm:p-3 rounded-md ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#161616] hover:bg-[#B0B0B0]"} mt-6 cursor-pointer`}
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>

                    <div className="mt-4 py-2 sm:py-3 text-sm">
                        <span className="text-[#6D6D6D]">Não possui conta? </span>
                        <a href="/register" className="text-[#515153] underline font-bold">
                            Crie uma agora
                        </a>
                    </div>
                </form>
            </div></>
    )
}

export default LoginForm