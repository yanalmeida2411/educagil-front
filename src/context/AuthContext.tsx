'use client'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

import { authService } from "@/services/auth";
import { setSessionExpiredHandler } from "@/lib/http";
import {
    clearSession,
    patchSessionUser,
    readSession,
    sessionFromApi,
    StoredSession,
    writeSession,
} from "@/lib/session";
import type { User } from "@/types/api";

type SessionUser = StoredSession['user'];

interface AuthContextData {
    /** Dados mínimos do usuário, disponíveis logo no carregamento (vêm do cookie). */
    user: SessionUser | null;
    /** Perfil completo vindo de `/users/me`; `null` até a primeira busca terminar. */
    profile: User | null;
    isAuthenticated: boolean;
    /** `true` enquanto a sessão do cookie ainda não foi lida. */
    isLoading: boolean;
    signIn: (credentials: SignInProps) => Promise<void>;
    signOut: () => Promise<void>;
    /** Aplica um perfil recém-salvo no contexto e no cookie. */
    applyProfile: (user: User) => void;
}

type AuthProviderProps = {
    children: ReactNode
}

interface SignInProps {
    email: string;
    password: string;
}

export const AuthContext = createContext({} as AuthContextData)

export function useAuth(): AuthContextData {
    return useContext(AuthContext);
}

/**
 * Aceita apenas caminhos internos (`/algo`). Links absolutos ou
 * protocol-relative (`//host`) viram `null` para evitar open redirect.
 */
export function safeRedirect(target: string | null | undefined): string | null {
    if (!target) return null;
    if (!target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return null;
    return target;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<SessionUser | null>(null);
    const [profile, setProfile] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isAuthenticated = !!user;
    const router = useRouter();

    const applyProfile = useCallback((next: User) => {
        patchSessionUser(next);
        setProfile(next);
        setUser((current) => current && {
            id: next.id,
            name: next.name,
            email: next.email,
            role: next.role,
            avatar_url: next.avatar_url,
        });
    }, []);

    useEffect(() => {
        const session = readSession();
        setUser(session?.user ?? null);
        setIsLoading(false);

        if (session) {
            authService.me().then(applyProfile).catch(() => undefined);
        }

        setSessionExpiredHandler(() => {
            setUser(null);
            setProfile(null);
            router.push('/login');
        });

        return () => setSessionExpiredHandler(null);
    }, [applyProfile, router]);

    async function signIn({ email, password }: SignInProps) {
        const session = await authService.login({ email, password });
        writeSession(sessionFromApi(session));
        setUser(sessionFromApi(session).user);
        setProfile(session.user);
        router.push('/');
    }

    async function signOut() {
        const refresh = readSession()?.refresh;
        if (refresh) {
            await authService.logout(refresh).catch(() => undefined);
        }
        clearSession();
        setUser(null);
        setProfile(null);
        router.push('/login');
    }

    return (
        <AuthContext.Provider value={{ user, profile, isAuthenticated, isLoading, signIn, signOut, applyProfile }}>
            {children}
        </AuthContext.Provider>
    )
}
