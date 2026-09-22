import { useRegister } from '@/hooks/useRegister'
import Link from 'next/link'
import React from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'

const RegisterForm = () => {
  const {
    name,
    isValidName,
    lastName,
    isValidLastName,
    email,
    setEmail,
    isValidEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isMatch,
    isValidPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    error,
    successMessage,
    handleNameChange,
    handleLastNameChange,
    handleSubmit,
    userType,
    setUserType
  } = useRegister()
  return (
    <>
      <div className="bg-white p-6 sm:p-7 md:p-8 sm:rounded-lg sm:border sm:shadow-sm sm:shadow-[#B0B0B0] sm:border-[#E6E6E6] text-[#333232]">
        <h2 className="text-2xl font-semibold mb-4">Crie sua conta!</h2>

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="pl-2 block text-base font-semibold text-[#6D6D6D] mb-1">Nome</label>
            <input
              id="nameRegister"
              type="text"
              placeholder="Ex. João"
              className={`w-full p-3 border rounded-md ${isValidName === null ? "border-gray-300" : isValidName ? "border-green-500" : "border-red-500"}`}
              value={name}
              onChange={handleNameChange}
              autoComplete="name"
            />
          </div>

          <div>
            <label className="pl-2 block text-base font-semibold text-[#6D6D6D] mb-1">Sobrenome</label>
            <input
              id="nameRegister"
              type="text"
              placeholder="Ex. Silva"
              className={`w-full p-3 border rounded-md ${isValidLastName === null ? "border-gray-300" : isValidLastName ? "border-green-500" : "border-red-500"}`}
              value={lastName}
              onChange={handleLastNameChange}
              autoComplete="name"
            />
          </div>

          <div>
            <label className="pl-2 block text-base font-semibold text-[#6D6D6D] mb-1">Email</label>
            <input
              id="emailRegister"
              type="email"
              placeholder="Ex. joaosilva@gmail.com"
              className={`w-full p-3 border rounded-md ${isValidEmail === null ? "border-gray-300" : isValidEmail ? "border-green-500" : "border-red-500"}`}
              value={email.toLowerCase()}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {email && !isValidEmail && <p id="emailInvalidRegister" className="text-xs text-red-600 mt-1">E-mail inválido</p>}
          </div>

          <div>
            <label className="pl-2 block text-base font-semibold text-[#6D6D6D] mb-1">Senha</label>
            <div className="relative">
              <input
                id="passwordRegister"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                className={`w-full p-3 border rounded-md ${isValidPassword === null ? "border-gray-300" : isValidPassword ? "border-green-500" : "border-red-500"}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button id="btnViewPassword" type="button" className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" 
              onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <p className="text-xs text-[#6D6D6D] mt-1">Mínimo 6 caracteres, 1 maiúscula, 1 número e 1 especial</p>
          </div>

          <div>
            <label className="pl-2 block text-base font-semibold text-[#6D6D6D] mb-1">Confirmar senha</label>
            <div className="relative">
              <input
                id="confirmPasswordRegister"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repita sua senha"
                className={`w-full p-3 border rounded-md mb-1 ${isMatch === null ? "border-gray-300" : isMatch ? "border-green-500" : "border-red-500"}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                id="btnViewConfirmPassword"
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>


            </div>
            {confirmPassword && !isMatch && <p id="textconfirmPasswordRegister" className="text-xs text-red-600 mt-1">As senhas não coincidem</p>}

            
          </div>
            <div className='relative'>
              <label className="pl-2 block text-base font-semibold text-[#6D6D6D] mb-1 ">Selecione o seu perfil</label>
              <select
                id="userType"
                onChange={(e) => setUserType(e.target.value)}
                value={userType}
                className={`w-full p-3 border rounded-md text-base bg-white 
                ${userType === "" ? "text-[#6d6d6dc9] border-gray-300" : "text-black border-green-500"}`}>
                <option
                  value=""
                  disabled>Professor ou Estudante</option>
                <option value="S">Estudante</option>
                <option value="T">Professor</option>
              </select>
            </div>

          {error && <p id="textErrorRegister" className="text-red-600 text-sm font-medium bg-red-100 border border-red-300 rounded p-2">{error}</p>}
          {successMessage && <p id="textSuccessRegister" className="text-center text-green-700 text-sm font-semibold bg-green-100 border border-green-400 rounded p-3">{successMessage}</p>}

          <button
            id="submit"
            type="submit"
            disabled={loading}
            className={`w-full text-white text-base font-medium py-2.5 rounded-md mt-3 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#333232] hover:bg-[#B0B0B0]"} cursor-pointer`}
          >
            {loading ? "Cadastrando..." : "Criar conta"}
          </button>

          <div className="mt-2 text-center">
            <span className="text-xs text-[#6D6D6D]">Já possui uma conta? </span>
            <Link id="btnLogIn" href="/login" className="text-xs text-[#6D6D6D] font-bold underline">
              Faça o Log in
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}

export default RegisterForm