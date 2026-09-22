'use client';

import { LuAward, LuBookOpen, LuCircleCheck, LuExternalLink, LuStar, LuUsers } from 'react-icons/lu';

import { AppShell, PageHeader } from '@/components/layout/AppShell';
import { ProfileForm } from '@/components/forms/ProfileForm';
import { ButtonLink } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Display';
import { ErrorState, Skeleton } from '@/components/ui/Feedback';
import { useAuth } from '@/context/AuthContext';
import { learningService, teacherService } from '@/services/learning';
import { authService } from '@/services/auth';
import { useAsync } from '@/lib/useAsync';
import { ROLE_LABELS, formatDate, formatPercent, formatRating } from '@/lib/format';
import type { Role } from '@/types/api';

function StudentSummary() {
  const stats = useAsync(() => learningService.dashboard(), []);
  if (stats.loading || !stats.data) return <Skeleton className="h-24 w-full" />;

  const data = stats.data;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Matriculados" value={data.enrolled_courses} icon={<LuBookOpen className="size-5" />} />
      <StatCard label="Concluídos" value={data.completed} icon={<LuCircleCheck className="size-5" />} />
      <StatCard label="Certificados" value={data.certificates} icon={<LuAward className="size-5" />} />
      <StatCard label="Progresso geral" value={formatPercent(data.overall_progress)} />
    </div>
  );
}

function TeacherSummary({ userId }: { userId: string }) {
  const stats = useAsync(() => teacherService.dashboard(), []);
  if (stats.loading || !stats.data) return <Skeleton className="h-24 w-full" />;

  const data = stats.data;
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Cursos publicados" value={data.published_courses} icon={<LuBookOpen className="size-5" />} />
        <StatCard label="Alunos" value={data.total_students} icon={<LuUsers className="size-5" />} />
        <StatCard
          label="Avaliação média"
          value={data.rating_average > 0 ? formatRating(data.rating_average) : '—'}
          icon={<LuStar className="size-5" />}
          className="col-span-2 lg:col-span-1"
        />
      </div>
      <ButtonLink
        href={`/teachers/${userId}`}
        variant="outline"
        size="sm"
        className="self-start"
        rightIcon={<LuExternalLink aria-hidden="true" />}
      >
        Ver meu perfil público
      </ButtonLink>
    </div>
  );
}

function RoleSummary({ role, userId }: { role: Role; userId: string }) {
  if (role === 'STUDENT') return <StudentSummary />;
  if (role === 'TEACHER') return <TeacherSummary userId={userId} />;
  return null;
}

export default function ProfilePage() {
  const { profile: cached } = useAuth();
  // Busca sempre a versão atual: o perfil do contexto pode estar desatualizado.
  const profile = useAsync(() => authService.me(), []);
  const data = profile.data ?? cached;

  return (
    <AppShell>
      <PageHeader title="Meu perfil" description="Como você aparece para alunos, professores e na plataforma." />

      {profile.error && !data ? (
        <ErrorState title="Não foi possível carregar seu perfil" onRetry={profile.reload} />
      ) : !data ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
          <div className="flex min-w-0 flex-col gap-8">
            <RoleSummary role={data.role} userId={data.id} />

            <Card className="p-5 sm:p-6">
              <h2 className="mb-5 text-lg font-bold text-ink">Editar perfil</h2>
              {/* key: remonta o formulário quando os dados frescos chegam. */}
              <ProfileForm key={data.updated_at} profile={data} />
            </Card>
          </div>

          <Card as="section" className="flex h-fit flex-col gap-3 p-5 text-sm">
            <h2 className="font-semibold text-ink">Conta</h2>
            <dl className="flex flex-col gap-2">
              <div>
                <dt className="text-ink-muted">E-mail</dt>
                <dd className="break-all font-medium text-ink">{data.email}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Tipo de conta</dt>
                <dd className="font-medium text-ink">{ROLE_LABELS[data.role]}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Membro desde</dt>
                <dd className="font-medium text-ink">{formatDate(data.created_at)}</dd>
              </div>
            </dl>
            <ButtonLink href="/settings" variant="outline" size="sm">
              Alterar senha
            </ButtonLink>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
