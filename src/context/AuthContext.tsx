'use client'
import { createContext, ReactNode, useState } from "react";
import { destroyCookie, setCookie } from "nookies";
import { api } from "../services/api/apiClient"; 
import { useRouter } from 'next/navigation';

interface AuthContextData {
    user: UserProps;
    isAuthenticated: boolean;
    signIn: (credentials: SignInProps) => Promise<void>
     signOut: () => void; 
}

interface UserProps {
    access: string;
    refresh: string;
    full_name: string;
    user_type: string;
}

type AuthProviderProps = {
    children: ReactNode
}

interface SignInProps {
    email: string;
    password: string;
}

export const AuthContext = createContext({} as AuthContextData)



export function AuthProvider({ children }: AuthProviderProps) {
     
    const [user, setUser] = useState<UserProps>()
    const isAuthenticated = !!user;
    const router = useRouter();


    async function signIn({ email, password }: SignInProps) {
        try {
            const response = await api.post("/token/", {
                email,
                password
            })

            const { access, refresh, full_name, user_type,csrfToken } = response.data;
            const cookieValue = JSON.stringify({ access,refresh, full_name, user_type,csrfToken })
            setCookie(undefined, '@educagil.token', cookieValue, {
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            })

            setUser({
                access,
                refresh,
                full_name,
                user_type
            })

            api.defaults.headers.common['Authorization'] = `Bearer ${cookieValue}`


             router.push('/')



        } catch (err) {
            console.log('Error ao entrar', err) //testar regex
        }
    }

    function signOut() {
    try {
      destroyCookie(null, '@educagil.token', { path: '/' });
      setUser(undefined);
      router.push('/login');
    } catch (err) {
      console.error('Erro ao deslogar usuário:', err);
    }
  }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, signIn,signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

