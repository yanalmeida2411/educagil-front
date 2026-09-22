'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Field';
import { Alert } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { ApiError } from '@/lib/http';
import { LESSON_TYPE_LABELS } from '@/lib/format';
import { resolveVideo } from '@/components/learning/VideoPlayer';
import { LESSON_TYPES } from '@/types/api';
import type { Lesson, LessonPayload, LessonType } from '@/types/api';

const TYPE_HINTS: Record<LessonType, string> = {
  VIDEO: 'Cole um link do YouTube, Vimeo ou de um arquivo .mp4.',
  TEXT: 'Escreva o conteúdo. Suporta ## títulos, - listas, **negrito**, `código` e blocos ```.',
  PDF: 'Link público para o material (PDF ou outro arquivo).',
  QUIZ: 'Depois de criar a aula, use "Editar quiz" para cadastrar as questões.',
};

const isHttpUrl = (value: string) => /^https?:\/\/\S+$/i.test(value);

export function LessonFormModal({
  open,
  lesson,
  onClose,
  onSubmit,
}: {
  open: boolean;
  lesson?: Lesson | null;
  onClose: () => void;
  onSubmit: (payload: LessonPayload) => Promise<void>;
}) {
  const [title, setTitle] = useState(lesson?.title ?? '');
  const [description, setDescription] = useState(lesson?.description ?? '');
  const [type, setType] = useState<LessonType>(lesson?.type ?? 'VIDEO');
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url ?? '');
  const [materialUrl, setMaterialUrl] = useState(lesson?.material_url ?? '');
  const [content, setContent] = useState(lesson?.content ?? '');
  const [minutes, setMinutes] = useState(String(Math.floor((lesson?.duration_seconds ?? 0) / 60)));
  const [seconds, setSeconds] = useState(String((lesson?.duration_seconds ?? 0) % 60));
  const [isRequired, setIsRequired] = useState(lesson?.is_required ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    if (title.trim().length < 2) return 'O título da aula deve ter ao menos 2 caracteres.';
    if (type === 'VIDEO' && !isHttpUrl(videoUrl.trim())) return 'Informe uma URL de vídeo válida.';
    if (type === 'PDF' && !isHttpUrl(materialUrl.trim())) return 'Informe uma URL de material válida.';
    if (type === 'TEXT' && content.trim().length === 0) return 'Escreva o conteúdo da aula.';
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    const duration = Math.max(0, (Number(minutes) || 0) * 60 + (Number(seconds) || 0));

    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        type,
        // Só o campo coerente com o tipo é enviado; os demais vão nulos para
        // não sobrar lixo de um tipo anterior.
        video_url: type === 'VIDEO' ? videoUrl.trim() : null,
        material_url: type === 'PDF' ? materialUrl.trim() : null,
        content: type === 'TEXT' ? content : null,
        duration_seconds: duration,
        is_required: isRequired,
      });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar a aula.');
    } finally {
      setSaving(false);
    }
  }

  const videoKind = type === 'VIDEO' && isHttpUrl(videoUrl.trim()) ? resolveVideo(videoUrl.trim()).kind : null;

  return (
    <Modal open={open} onClose={onClose} dismissible={!saving} size="lg" title={lesson ? 'Editar aula' : 'Nova aula'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert tone="error">{error}</Alert>}

        <Input
          label="Título"
          required
          autoFocus
          maxLength={160}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <Select
            label="Tipo de aula"
            value={type}
            // Mudar o tipo de uma aula de quiz existente apagaria o sentido
            // das tentativas já feitas; bloqueamos na edição.
            disabled={Boolean(lesson) && lesson?.type === 'QUIZ'}
            onChange={(event) => setType(event.target.value as LessonType)}
            options={LESSON_TYPES.map((value) => ({ value, label: LESSON_TYPE_LABELS[value] }))}
            hint={TYPE_HINTS[type]}
          />

          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-semibold text-ink-muted">Duração</legend>
            <div className="flex items-center gap-2">
              <Input
                aria-label="Minutos"
                type="number"
                min={0}
                max={1440}
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
                className="w-20"
              />
              <span className="text-sm text-ink-muted">min</span>
              <Input
                aria-label="Segundos"
                type="number"
                min={0}
                max={59}
                value={seconds}
                onChange={(event) => setSeconds(event.target.value)}
                className="w-20"
              />
              <span className="text-sm text-ink-muted">s</span>
            </div>
          </fieldset>
        </div>

        {type === 'VIDEO' && (
          <Input
            label="URL do vídeo"
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            hint={
              videoKind === 'external'
                ? 'Este link não é incorporável: o aluno verá um botão para abrir em outra aba.'
                : videoKind
                  ? 'Link reconhecido: o vídeo será reproduzido dentro do player.'
                  : undefined
            }
          />
        )}

        {type === 'PDF' && (
          <Input
            label="URL do material"
            type="url"
            required
            placeholder="https://..."
            value={materialUrl}
            onChange={(event) => setMaterialUrl(event.target.value)}
          />
        )}

        {type === 'TEXT' && (
          <Textarea
            label="Conteúdo"
            required
            rows={10}
            className="font-mono text-sm"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        )}

        <Textarea
          label="Resumo (opcional)"
          rows={2}
          maxLength={1000}
          placeholder="Uma linha sobre o que a aula aborda."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <Checkbox
          label="Aula obrigatória"
          hint="Aulas obrigatórias contam para o progresso e para o certificado."
          checked={isRequired}
          onChange={(event) => setIsRequired(event.target.checked)}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            {lesson ? 'Salvar aula' : 'Criar aula'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
