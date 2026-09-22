'use client';
import { useEffect, useState } from 'react';

type UserInfo = {
  full_name: string | null;
  user_type: string | null;
};

export function useUserInfoFromCookies() {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    full_name: null,
    user_type: null,
  });

  useEffect(() => {
    const cookies = document.cookie;
    const match = cookies.match(/@educagil\.token=([^;]+)/);

    if (match) {
      try {
        const encodedValue = match[1];
        const decodedValue = decodeURIComponent(encodedValue);
        const json = JSON.parse(decodedValue);

        setUserInfo({
          full_name: json.full_name ?? null,
          user_type: json.user_type ?? null,
        });
      } catch (error) {
        console.error('Erro ao processar o cookie @educagil.token:', error);
      }
    }
  }, []);

  return userInfo;
}
