import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    // 👉 Loga todos os headers pra ver se o cookie veio
    console.log('Headers recebidos:', request.headers);

   const cookie = request.headers.get('cookie');
console.log('Headers recebidos:', request.headers);
console.log('🍪 Cookie bruto:', cookie);
    if (!cookie) {
      console.log('⚠️ Nenhum cookie encontrado no header');
      return NextResponse.json({ error: 'No cookie' }, { status: 401 });
    }

    console.log('🍪 Cookie bruto:', cookie);

    const accessTokenMatch = cookie.match(/accessToken=([^;]+)/);
    if (!accessTokenMatch) {
      console.log('⚠️ accessToken não encontrado no cookie');
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    const accessToken = accessTokenMatch[1];
    console.log('🧩 Access Token extraído:', accessToken);

    // 👉 Tenta decodificar pra ver se o token é válido
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || 'sua_chave_secreta');
    console.log('✅ Token decodificado:', decoded);

    const { full_name, user_type } = decoded as any;

    return NextResponse.json({ full_name, user_type });
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error);
    return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 });
  }
}
