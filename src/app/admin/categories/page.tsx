'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';

import { AppShell, PageHeader } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import { Input, Textarea } from '@/components/ui/Field';
import { ErrorState } from '@/components/ui/Feedback';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { adminService } from '@/services/admin';
import { courseService } from '@/services/courses';
import { useAsync } from '@/lib/useAsync';
import { ApiError } from '@/lib/http';
import type { Category } from '@/types/api';

interface FormState {
  name: string;
  description: string;
  icon: string;
}

const EMPTY_FORM: FormState = { name: '', description: '', icon: '' };

export default function AdminCategoriesPage() {
  const toast = useToast();
  const categories = useAsync(() => courseService.categories(), []);

  // Sem `editing`, o modal cria uma categoria nova.
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);

  const [removing, setRemoving] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setForm({ name: category.name, description: category.description ?? '', icon: category.icon ?? '' });
    setErrors({});
    setFormOpen(true);
  }

  async function save(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const name = form.name.trim();
    if (name.length < 2) {
      setErrors({ name: 'O nome precisa ter ao menos 2 caracteres.' });
      return;
    }

    const payload = {
      name,
      description: form.description.trim() || null,
      icon: form.icon.trim() || null,
    };

    setSaving(true);
    try {
      if (editing) {
        await adminService.updateCategory(editing.id, payload);
        toast.success('Categoria atualizada.');
      } else {
        await adminService.createCategory(payload);
        toast.success('Categoria criada.');
      }
      setFormOpen(false);
      categories.reload();
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length > 0) {
        setErrors(err.fields as Partial<Record<keyof FormState, string>>);
      } else {
        toast.error(err instanceof ApiError ? err.message : 'Não foi possível salvar a categoria.');
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!removing) return;
    setDeleting(true);
    try {
      await adminService.removeCategory(removing.id);
      toast.success('Categoria excluída.');
      setRemoving(null);
      categories.reload();
    } catch (err) {
      // 409: a categoria ainda tem cursos vinculados.
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível excluir a categoria.');
      setRemoving(null);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Array<Column<Category>> = [
    {
      key: 'name',
      header: 'Categoria',
      render: (category) => (
        <div className="flex min-w-0 flex-col">
          <span className="font-semibold text-ink">{category.name}</span>
          <span className="truncate text-xs text-ink-muted">/{category.slug}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      hideOnMobile: true,
      render: (category) => (
        <span className="line-clamp-2 text-ink-muted">{category.description || '—'}</span>
      ),
    },
    {
      key: 'courses',
      header: 'Cursos',
      align: 'right',
      render: (category) => <span className="tabular-nums">{category.courses_count}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Ações</span>,
      align: 'right',
      render: (category) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" aria-label={`Editar ${category.name}`} onClick={() => openEdit(category)}>
            <LuPencil className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Excluir ${category.name}`}
            onClick={() => setRemoving(category)}
            disabled={category.courses_count > 0}
            title={category.courses_count > 0 ? 'Mova ou exclua os cursos antes de excluir a categoria.' : undefined}
          >
            <LuTrash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Categorias"
        description="Organize o catálogo. Categorias com cursos vinculados não podem ser excluídas."
        actions={
          <Button leftIcon={<LuPlus aria-hidden="true" />} onClick={openCreate}>
            Nova categoria
          </Button>
        }
      />

      {categories.error ? (
        <ErrorState title="Não foi possível carregar as categorias" onRetry={categories.reload} />
      ) : (
        <DataTable
          columns={columns}
          rows={categories.data ?? []}
          rowKey={(category) => category.id}
          loading={categories.loading && !categories.data}
          caption="Categorias do catálogo"
          emptyTitle="Nenhuma categoria cadastrada"
          emptyDescription="Crie categorias para que os professores possam classificar seus cursos."
          emptyAction={{ label: 'Criar categoria', onClick: openCreate }}
        />
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        dismissible={!saving}
        title={editing ? 'Editar categoria' : 'Nova categoria'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" form="category-form" loading={saving}>
              Salvar
            </Button>
          </>
        }
      >
        <form id="category-form" onSubmit={save} className="flex flex-col gap-4" noValidate>
          <Input
            label="Nome"
            required
            maxLength={80}
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            error={errors.name}
            hint={editing ? 'Alterar o nome também atualiza o endereço da categoria.' : undefined}
          />
          <Textarea
            label="Descrição"
            maxLength={500}
            rows={3}
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            error={errors.description}
          />
          <Input
            label="Ícone"
            maxLength={60}
            value={form.icon}
            onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}
            error={errors.icon}
            hint="Identificador opcional do ícone, por exemplo: monitor, server, bar-chart."
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
        loading={deleting}
        title="Excluir categoria?"
        description={`"${removing?.name}" será removida do catálogo. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
      />
    </AppShell>
  );
}
