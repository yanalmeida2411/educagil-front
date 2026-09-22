import type { Metadata } from 'next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Recuperar senha',
  description: 'Receba um link para criar uma nova senha na Educagil.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      illustration="/assets/svg/emailRecovery.svg"
      headline="Acontece com todo mundo."
      subline="Em poucos minutos você volta a estudar."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
