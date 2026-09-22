'use client';

import dynamic from 'next/dynamic';

const LazyPasswordResetConfirm = dynamic(() => import('./PasswordResetClient'), {
  ssr: false,
});

export default function PasswordResetConfirmPage() {
  return <LazyPasswordResetConfirm />;
}
