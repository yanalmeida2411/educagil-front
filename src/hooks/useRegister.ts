import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export const useRegister = () => {
  const [name, setName] = useState("");
  const [isValidName, setIsValidName] = useState<boolean | null>(null);
  const [lastName, setLastName] = useState("");
  const [isValidLastName, setIsValidLastName] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isMatch, setIsMatch] = useState<boolean | null>(null);
  const [isValidPassword, setIsValidPassword] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userType, setUserType] = useState<string>("");
  const router = useRouter();

  const nameRegex = /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕ][a-záéíóúâêîôûãõ]+$/;
  const lastNameRegex = /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕ][a-záéíóúâêîôûãõ]+$/;
  const emailRegex = /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/;

  const validatePassword = (pwd: string) => {
    const hasMinLen = pwd.length >= 6;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    return hasMinLen && hasUpper && hasNumber && hasSpecial;
  };

  useEffect(() => {
    setIsValidName(name ? nameRegex.test(name) : null);
  }, [name]);

  useEffect(() => {
    setIsValidLastName(lastName ? lastNameRegex.test(lastName) : null);
  }, [lastName]);

  useEffect(() => {
    setIsValidEmail(email ? emailRegex.test(email) : null);
  }, [email]);

  useEffect(() => {
    setIsValidPassword(password ? validatePassword(password) : null);
  }, [password]);

  useEffect(() => {
    setIsMatch(confirmPassword ? confirmPassword === password : null);
  }, [confirmPassword, password]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameFiltered = e.target.value.replace(/[0-9]/g, "");
    setName(nameFiltered);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lastNameFiltered = e.target.value.replace(/[0-9]/g, "");
    setLastName(lastNameFiltered);
  };

  const resetForm = () => {
    setName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setIsValidName(null);
    setIsValidEmail(null);
    setIsValidPassword(null);
    setIsMatch(null);
    setUserType("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !name ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !userType
    ) {
      setError("Todos os campos devem ser preenchidos.");
      return;
    }
    // lembrar de mudar o nome para o inglês antes de entregar o projeto
    const dados = {
      user: {
        name: name,
        lastName: lastName,
        email: email,
        user_type: userType,
        password: password,
        confirm_password: confirmPassword,
      },
    };

    setLoading(true);
    try {
      const response = await axios.post(
        "https://back-educagil.onrender.com/create-user/",
        dados,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      setSuccessMessage(
        "Parabéns! Usuário cadastrado com sucesso. Para ativar sua conta, siga as instruções enviadas para o seu e-mail. Por favor, não esqueça de verificar também a caixa de spam."
      );
      resetForm();

      setTimeout(() => router.push("/login"), 6000);
    } catch (err: any) {
      const extractFirstError = (data: any): string | null => {
        if (typeof data !== "object" || data === null) return null;

        for (const key in data) {
          if (Array.isArray(data[key]) && data[key].length > 0) {
            return data[key][0];
          }
          if (typeof data[key] === "object") {
            const nestedError = extractFirstError(data[key]);
            if (nestedError) return nestedError;
          }
        }
        return null;
      };

      const msg = err?.response?.data?.detail;
      err?.response?.data?.message;

      JSON.stringify(err?.response?.data);

      extractFirstError(err?.response?.data);
      ("Erro inesperado no servidor. Tente novamente mais tarde.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    lastName,
    setLastName,
    isValidName,
    isValidLastName,
    email,
    setEmail,
    isValidEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isMatch,
    setIsMatch,
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
    setUserType,
    validatePassword,
  };
};
