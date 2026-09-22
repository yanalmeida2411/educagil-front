'use client';

import { CourseForm } from '@/components/authoring/CourseForm';
import { useCourseEditor } from '@/components/authoring/CourseEditorContext';
import { Card } from '@/components/ui/Display';
import { useToast } from '@/components/ui/Toast';
import { courseService } from '@/services/courses';

export default function CourseInfoPage() {
  const toast = useToast();
  const { detail, reload } = useCourseEditor();

  return (
    <Card className="max-w-3xl p-5 sm:p-6">
      <CourseForm
        key={detail.course.updated_at}
        initial={detail.course}
        submitLabel="Salvar alterações"
        onSubmit={async (payload) => {
          await courseService.update(detail.course.id, payload);
          toast.success('Informações do curso salvas.');
          reload();
        }}
      />
    </Card>
  );
}
