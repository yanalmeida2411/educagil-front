'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import { courseService } from '@/services/courses';
import { useAsync } from '@/lib/useAsync';
import { ApiError } from '@/lib/http';
import { LEVEL_LABELS } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { Alert } from '@/components/ui/Feedback';
import { COURSE_LEVELS } from '@/types/api';
import type { Course, CourseLevel, CoursePayload } from '@/types/api';
import { ListEditor } from './ListEditor';

interface CourseFormProps {
  initial?: Course;
  submitLabel: string;
  onSubmit: (payload: CoursePayload) => Promise<void>;
}

type FieldErrors = Partial<Record<keyof CoursePayload, string>>;

/** Validação local com os mesmos limites do backend (dto.go). */
function validate(payload: CoursePayload): FieldErrors {
  const errors: FieldErrors = {};
  if (payload.title.trim().length < 3) errors.title = 'O título deve ter ao menos 3 caracteres.';
  if (payload.short_description.trim().length < 10) errors.short_description = 'Escreva ao menos 10 caracteres.';
  if (payload.description.trim().length < 20) errors.description = 'Descreva o curso com ao menos 20 caracteres.';
  if (!payload.category_id) errors.category_id = 'Escolha uma categoria.';
  if (payload.thumbnail_url && !/^https?:\/\/\S+$/i.test(payload.thumbnail_url)) {
    errors.thumbnail_url = 'Informe uma URL começando com http:// ou https://.';
  }
  return errors;
}

export function CourseForm({ initial, submitLabel, onSubmit }: CourseFormProps) {
  const categories = useAsync(() => courseService.categories(), []);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [shortDescription, setShortDescription] = useState(initial?.short_description ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? '');
  const [level, setLevel] = useState<CourseLevel>(initial?.level ?? 'BEGINNER');
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnail_url ?? '');
  const [objectives, setObjectives] = useState<string[]>(initial?.objectives ?? []);
  const [requirements, setRequirements] = useState<string[]>(initial?.requirements ?? []);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const payload: CoursePayload = {
      title: title.trim(),
      short_description: shortDescription.trim(),
      description: description.trim(),
      category_id: categoryId,
      level,
      thumbnail_url: thumbnailUrl.trim() || null,
      objectives,
      requirements,
    };

    const localErrors = validate(payload);
    setErrors(localErrors);
    if (Object.keys(localErrors).length > 0) {
      setFormError('Revise os campos destacados.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields as FieldErrors);
        setFormError(err.message);
      } else {
        setFormError('Não foi possível salvar o curso.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formError && <Alert tone="error">{formError}</Alert>}

      <Input
        label="Título"
        required
        maxLength={160}
        placeholder="Ex.: React do Zero ao Profissional"
        value={title}
        error={errors.title}
        hint="O endereço do curso é gerado a partir do título."
        onChange={(event) => setTitle(event.target.value)}
      />

      <Textarea
        label="Descrição curta"
        required
        rows={2}
        maxLength={300}
        placeholder="Uma frase que aparece no card do catálogo."
        value={shortDescription}
        error={errors.short_description}
        hint={`${shortDescription.length}/300`}
        onChange={(event) => setShortDescription(event.target.value)}
      />

      <Textarea
        label="Descrição completa"
        required
        rows={6}
        placeholder="O que o aluno vai encontrar, para quem é o curso e como ele está organizado."
        value={description}
        error={errors.description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Categoria"
          required
          placeholder={categories.loading ? 'Carregando...' : 'Selecione'}
          value={categoryId}
          error={errors.category_id}
          onChange={(event) => setCategoryId(event.target.value)}
          options={(categories.data ?? []).map((category) => ({ value: category.id, label: category.name }))}
        />
        <Select
          label="Nível"
          required
          value={level}
          onChange={(event) => setLevel(event.target.value as CourseLevel)}
          options={COURSE_LEVELS.map((value) => ({ value, label: LEVEL_LABELS[value] }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_12rem] sm:items-start">
        <Input
          label="URL da imagem de capa"
          type="url"
          placeholder="https://images.unsplash.com/..."
          value={thumbnailUrl}
          error={errors.thumbnail_url}
          hint="Proporção 16:9 funciona melhor."
          onChange={(event) => setThumbnailUrl(event.target.value)}
        />
        <div className="aspect-video overflow-hidden rounded-lg border border-border-subtle bg-surface-muted sm:mt-7">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- pré-visualização de URL digitada pelo professor
            <img src={thumbnailUrl} alt="Pré-visualização da capa" className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-xs text-ink-subtle">Sem capa</span>
          )}
        </div>
      </div>

      <ListEditor
        label="O que o aluno vai aprender"
        placeholder="Ex.: Criar componentes reutilizáveis"
        hint="Frases curtas e concretas. Aparecem em destaque na página do curso."
        items={objectives}
        onChange={setObjectives}
      />

      <ListEditor
        label="Requisitos"
        placeholder="Ex.: JavaScript básico"
        items={requirements}
        onChange={setRequirements}
      />

      <Button type="submit" size="lg" loading={saving} className="self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
