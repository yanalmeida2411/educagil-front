'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LuArchive,
  LuEllipsisVertical,
  LuEye,
  LuPencil,
  LuSend,
  LuTrash2,
  LuUndo2,
} from 'react-icons/lu';

import { Dropdown, DropdownDivider, DropdownItem } from '@/components/ui/Dropdown';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { courseService } from '@/services/courses';
import { ApiError } from '@/lib/http';
import type { Course, CourseStatus } from '@/types/api';

type PendingAction = { kind: 'status'; status: CourseStatus } | { kind: 'delete' } | null;

const STATUS_COPY: Partial<Record<CourseStatus, { title: string; description: string; confirm: string; success: string }>> = {
  PUBLISHED: {
    title: 'Enviar curso para revisão?',
    description:
      'Um administrador vai revisar o conteúdo antes de publicar no catálogo. Você continua podendo editar enquanto isso.',
    confirm: 'Enviar para revisão',
    success: 'Curso enviado para revisão.',
  },
  DRAFT: {
    title: 'Voltar para rascunho?',
    description: 'O curso sai do catálogo e novos alunos não poderão se matricular. Quem já está matriculado mantém o acesso.',
    confirm: 'Voltar para rascunho',
    success: 'Curso movido para rascunho.',
  },
  ARCHIVED: {
    title: 'Arquivar curso?',
    description: 'O curso sai do catálogo e da sua lista ativa. O histórico e os certificados dos alunos são preservados.',
    confirm: 'Arquivar',
    success: 'Curso arquivado.',
  },
};

/**
 * Menu de ações de um curso na tabela do professor, com confirmação para
 * tudo que muda a visibilidade do curso ou apaga dados.
 */
export function CourseActionsMenu({ course, onChanged }: { course: Course; onChanged: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState<PendingAction>(null);
  const [working, setWorking] = useState(false);

  const canSubmit = course.status === 'DRAFT' || course.status === 'ARCHIVED';
  const canUnpublish = course.status === 'PUBLISHED' || course.status === 'PENDING_REVIEW';

  async function run() {
    if (!pending) return;
    setWorking(true);

    try {
      if (pending.kind === 'delete') {
        await courseService.remove(course.id);
        toast.success('Curso excluído.');
      } else {
        await courseService.setStatus(course.id, pending.status);
        toast.success(STATUS_COPY[pending.status]?.success ?? 'Status atualizado.');
      }
      setPending(null);
      onChanged();
    } catch (err) {
      // Curso com alunos é arquivado pelo backend em vez de excluído (409).
      if (err instanceof ApiError && err.status === 409 && pending.kind === 'delete') {
        toast.info(err.message);
        setPending(null);
        onChanged();
      } else {
        toast.error(err instanceof ApiError ? err.message : 'Não foi possível concluir a ação.');
      }
    } finally {
      setWorking(false);
    }
  }

  const copy = pending?.kind === 'status' ? STATUS_COPY[pending.status] : undefined;

  return (
    <>
      <Dropdown
        label={`Ações do curso ${course.title}`}
        trigger={() => (
          <span className="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink">
            <LuEllipsisVertical className="size-5" aria-hidden="true" />
          </span>
        )}
      >
        <DropdownItem icon={<LuPencil className="size-4" />} onClick={() => router.push(`/teacher/courses/${course.id}`)}>
          Editar
        </DropdownItem>
        <DropdownItem icon={<LuEye className="size-4" />} onClick={() => router.push(`/courses/${course.slug}`)}>
          Visualizar
        </DropdownItem>

        <DropdownDivider />

        {canSubmit && (
          <DropdownItem icon={<LuSend className="size-4" />} onClick={() => setPending({ kind: 'status', status: 'PUBLISHED' })}>
            Enviar para revisão
          </DropdownItem>
        )}
        {canUnpublish && (
          <DropdownItem icon={<LuUndo2 className="size-4" />} onClick={() => setPending({ kind: 'status', status: 'DRAFT' })}>
            {course.status === 'PUBLISHED' ? 'Despublicar' : 'Cancelar revisão'}
          </DropdownItem>
        )}
        {course.status !== 'ARCHIVED' && (
          <DropdownItem icon={<LuArchive className="size-4" />} onClick={() => setPending({ kind: 'status', status: 'ARCHIVED' })}>
            Arquivar
          </DropdownItem>
        )}

        <DropdownDivider />

        <DropdownItem tone="danger" icon={<LuTrash2 className="size-4" />} onClick={() => setPending({ kind: 'delete' })}>
          Excluir
        </DropdownItem>
      </Dropdown>

      <ConfirmDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={run}
        loading={working}
        title={pending?.kind === 'delete' ? 'Excluir curso?' : (copy?.title ?? 'Confirmar')}
        description={
          pending?.kind === 'delete'
            ? `"${course.title}" e todo o conteúdo serão excluídos. Se houver alunos matriculados, o curso será arquivado em vez de excluído.`
            : (copy?.description ?? '')
        }
        confirmLabel={pending?.kind === 'delete' ? 'Excluir' : (copy?.confirm ?? 'Confirmar')}
        destructive={pending?.kind === 'delete' || (pending?.kind === 'status' && pending.status === 'ARCHIVED')}
      />
    </>
  );
}
