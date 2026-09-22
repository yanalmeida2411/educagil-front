'use client';

import { useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { LuX } from 'react-icons/lu';

import { authService } from '@/services/auth';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/http';
import { Avatar } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { Alert } from '@/components/ui/Feedback';
import { useToast } from '@/components/ui/Toast';
import type { User } from '@/types/api';

/** Sugestões herdadas do formulário de perfil de professor original. */
const SUGGESTED_SPECIALTIES = [
  'Desenvolvedor',
  'Product Manager',
  'Product Owner',
  'Scrum Master',
  'UX/UI Designer',
  'Quality Assurance',
];

const MAX_SPECIALTIES = 10;

export function ProfileForm({ profile }: { profile: User }) {
  const toast = useToast();
  const { applyProfile } = useAuth();
  const isTeacher = profile.role === 'TEACHER';

  const [name, setName] = useState(profile.name);
  const [headline, setHeadline] = useState(profile.headline ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '');
  const [specialties, setSpecialties] = useState<string[]>(profile.specialties ?? []);
  const [specialtyInput, setSpecialtyInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function addSpecialty(raw: string) {
    const value = raw.trim();
    if (!value || specialties.length >= MAX_SPECIALTIES) return;
    if (specialties.some((item) => item.toLowerCase() === value.toLowerCase())) return;
    setSpecialties((current) => [...current, value]);
    setSpecialtyInput('');
  }

  function onSpecialtyKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addSpecialty(specialtyInput);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    if (name.trim().length < 2) {
      setFieldErrors({ name: 'Informe seu nome.' });
      return;
    }

    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        name: name.trim(),
        headline: headline.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        specialties: isTeacher ? specialties : [],
      });
      applyProfile(updated);
      toast.success('Perfil atualizado.');
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fields);
        setError(err.message);
      } else {
        setError('Não foi possível salvar o perfil.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex items-center gap-4">
        <Avatar name={name || profile.name} src={avatarUrl || null} size="xl" />
        <Input
          label="URL da foto"
          placeholder="https://..."
          type="url"
          value={avatarUrl}
          error={fieldErrors.avatar_url}
          hint="Cole o link de uma imagem pública (ex.: sua foto do GitHub)."
          onChange={(event) => setAvatarUrl(event.target.value)}
          containerClassName="flex-1"
        />
      </div>

      <Input
        label="Nome"
        required
        maxLength={120}
        value={name}
        error={fieldErrors.name}
        onChange={(event) => setName(event.target.value)}
      />

      <Input
        label={isTeacher ? 'Título profissional' : 'Título'}
        placeholder={isTeacher ? 'Ex.: Engenheira de software e instrutora de front-end' : 'Ex.: Estudante de desenvolvimento web'}
        maxLength={180}
        value={headline}
        error={fieldErrors.headline}
        onChange={(event) => setHeadline(event.target.value)}
      />

      <Textarea
        label="Biografia"
        rows={5}
        maxLength={2000}
        placeholder={isTeacher ? 'Conte sua trajetória e o que você ensina.' : 'Conte um pouco sobre você e seus objetivos.'}
        value={bio}
        error={fieldErrors.bio}
        hint={`${bio.length}/2000`}
        onChange={(event) => setBio(event.target.value)}
      />

      {isTeacher && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold text-ink-muted">Especialidades</legend>

          {specialties.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {specialties.map((item) => (
                <li key={item} className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1 text-sm text-brand-600">
                  {item}
                  <button
                    type="button"
                    aria-label={`Remover ${item}`}
                    onClick={() => setSpecialties((current) => current.filter((value) => value !== item))}
                    className="cursor-pointer rounded-full p-1 hover:bg-brand-100"
                  >
                    <LuX className="size-3" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Input
            aria-label="Adicionar especialidade"
            placeholder="Digite e pressione Enter"
            value={specialtyInput}
            maxLength={60}
            disabled={specialties.length >= MAX_SPECIALTIES}
            onChange={(event) => setSpecialtyInput(event.target.value)}
            onKeyDown={onSpecialtyKey}
            hint={`${specialties.length}/${MAX_SPECIALTIES} especialidades`}
          />

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_SPECIALTIES.filter((suggestion) => !specialties.includes(suggestion)).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addSpecialty(suggestion)}
                className="cursor-pointer rounded-full border border-dashed border-border-subtle px-3 py-1 text-xs text-ink-muted hover:border-brand-300 hover:text-brand-500"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <Button type="submit" loading={saving} className="self-start">
        Salvar perfil
      </Button>
    </form>
  );
}
