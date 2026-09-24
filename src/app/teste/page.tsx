'use client'
import { useEffect } from "react";
import { parseCookies, setCookie } from "nookies";
import { api } from "@/services/api/apiClient";

export default function TesteRefreshToken() {
  useEffect(() => {
    // 1. Força o token como inválido
    const cookies = parseCookies();
    const tokenData = JSON.parse(cookies["@educagil.token"] || "{}");

    tokenData.access = "token_invalido"; 

    setCookie(undefined, "@educagil.token", JSON.stringify(tokenData), {
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    console.log("✅ Token forçado como inválido. Aguardando teste...");

    
    const timer = setTimeout(async () => {
      try {
        const cookiesAntes = parseCookies();
        const tokenAntes = JSON.parse(cookiesAntes["@educagil.token"] || "{}").access;
        console.log("🔒 Token antes da requisição protegida:", tokenAntes);

        
        await api.get("/");

        const cookiesDepois = parseCookies();
        const tokenDepois = JSON.parse(cookiesDepois["@educagil.token"] || "{}").access;
        console.log("✅ Token após refresh automático:", tokenDepois);
      } catch (error) {
        console.error("❌ Erro ao testar requisição com refresh:", error);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Teste de Refresh Token</h2>
      <p className="text-sm">Veja o console para acompanhar o teste do refresh token automático.</p>
    </div>
  );
}
