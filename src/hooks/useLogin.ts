
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export const useLogin = () => {
  const { signIn } = useContext(AuthContext)
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setIsValidEmail(emailRegex.test(email));
    } else {
      setIsValidEmail(null);
    }
  }, [email]);

  const handleLogin = async (e?: React.FormEvent<HTMLFormElement>) => {
  if (e) e.preventDefault(); // <-- Impede recarregamento da página
  setLoading(true);

  try {
    const result = await signIn({ email, password });
    console.log("Login finalizado:", result);
  } catch (err) {
    console.log("Erro no handleLogin", err);
    setErrorMessage("Erro ao fazer login.");
  } finally {
    setLoading(false);
  }

   {/** e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "https://back-educagil.onrender.com/token/",
        {
          email,
          password,
        }
      );

      const { access, refresh, full_name, user_type } = response.data;

      await fetch("/api/set-token", {
        method: "POST",
        body: JSON.stringify({ access, refresh, full_name, user_type }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      router.push("/");
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

      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        extractFirstError(err?.response?.data) ||
        "Erro inesperado no servidor. Tente novamente mais tarde.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    } */}
  };
  return {
    email,
    setEmail,
    password,
    setPassword,
    isValidEmail,
    setIsValidEmail,
    showPassword,
    setShowPassword,
    loading,
    errorMessage,
    handleLogin,
  };
};
