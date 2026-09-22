import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';
import { Skeleton } from '@/components/ui/Feedback';

export const metadata: Metadata = {
  title: 'Redefinir senha',
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      illustration="/assets/svg/recovery.svg"
      headline="Quase lá."
      subline="Defina a nova senha e continue de onde parou."
    >
      {/* useSearchParams exige Suspense para não bloquear o prerender. */}
      <Suspense fallback={<Skeleton className="h-80 w-full" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
