'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { Alert } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { ApiError } from '@/lib/http';
import type { CourseModule, ModulePayload } from '@/types/api';

export function ModuleFormModal({
  open,
  module,
  onClose,
  onSubmit,
}: {
  open: boolean;
  /** Presente ao editar; ausente ao criar. */
  module?: CourseModule | null;
  onClose: () => void;
  onSubmit: (payload: ModulePayload) => Promise<void>;
}) {
  const [title, setTitle] = useState(module?.title ?? '');
  const [description, setDescription] = useState(module?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim().length < 2) {
      setError('O título do módulo deve ter ao menos 2 caracteres.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit({ title: title.trim(), description: description.trim() || null });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar o módulo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      title={module ? 'Editar módulo' : 'Novo módulo'}
      description="Módulos agrupam aulas relacionadas, na ordem em que o aluno deve estudá-las."
    >
      <form id="module-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert tone="error">{error}</Alert>}
        <Input
          label="Título"
          required
          autoFocus
          maxLength={160}
          placeholder="Ex.: Fundamentos"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Textarea
          label="Descrição (opcional)"
          rows={3}
          maxLength={1000}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            {module ? 'Salvar módulo' : 'Criar módulo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
