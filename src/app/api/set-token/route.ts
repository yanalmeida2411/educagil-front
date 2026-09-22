
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { access, refresh, full_name, user_type } = await request.json();

  const response = NextResponse.json({ success: true });

  response.cookies.set('accessToken', access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set('refreshToken', refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 10,
  });

   response.cookies.set('fullName', full_name, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set('userType', user_type, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
