'use client';

import { useRouter } from 'next/navigation';

import { AppShell, PageHeader } from '@/components/layout/AppShell';
import { CourseForm } from '@/components/authoring/CourseForm';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Display';
import { useToast } from '@/components/ui/Toast';
import { courseService } from '@/services/courses';

export default function NewCoursePage() {
  const router = useRouter();
  const toast = useToast();

  return (
    <AppShell>
      <PageHeader
        title="Novo curso"
        description="Comece pelas informações principais. Depois você monta os módulos e as aulas."
        actions={
          <ButtonLink href="/teacher/courses" variant="ghost">
            Cancelar
          </ButtonLink>
        }
      />

      <Card className="max-w-3xl p-5 sm:p-6">
        <CourseForm
          submitLabel="Criar curso e adicionar conteúdo"
          onSubmit={async (payload) => {
            const course = await courseService.create(payload);
            toast.success('Curso criado em rascunho. Agora adicione módulos e aulas.');
            router.push(`/teacher/courses/${course.id}/content`);
          }}
        />
      </Card>
    </AppShell>
  );
}
