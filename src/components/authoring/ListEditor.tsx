'use client';

import { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { LuPlus, LuX } from 'react-icons/lu';

import { Button } from '@/components/ui/Button';

/** Lista editável de frases curtas (objetivos, requisitos). */
export function ListEditor({
  label,
  hint,
  placeholder,
  items,
  onChange,
  max = 12,
  maxLength = 200,
}: {
  label: string;
  hint?: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
  max?: number;
  maxLength?: number;
}) {
  const inputId = useId();
  const [draft, setDraft] = useState('');

  function add() {
    const value = draft.trim();
    if (!value || items.length >= max || items.includes(value)) return;
    onChange([...items, value]);
    setDraft('');
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      add();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-semibold text-ink-muted">
        {label}
      </label>

      {items.length > 0 && (
        <ol className="flex flex-col gap-1.5">
          {items.map((item, index) => (
            <li key={item} className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-muted/40 px-3 py-2 text-sm">
              <span className="w-5 text-ink-subtle">{index + 1}.</span>
              <span className="flex-1 text-ink">{item}</span>
              <button
                type="button"
                aria-label={`Remover "${item}"`}
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="cursor-pointer rounded p-1 text-ink-muted hover:bg-surface-muted hover:text-danger"
              >
                <LuX className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      )}

      <div className="flex gap-2">
        <input
          id={inputId}
          value={draft}
          maxLength={maxLength}
          disabled={items.length >= max}
          placeholder={items.length >= max ? `Limite de ${max} itens` : placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          className="h-11 w-full rounded-lg border border-border-subtle bg-surface px-3 text-ink outline-none placeholder:text-ink-subtle focus:border-brand-400 disabled:bg-surface-muted"
        />
        <Button variant="secondary" onClick={add} disabled={!draft.trim() || items.length >= max} aria-label={`Adicionar a ${label}`}>
          <LuPlus aria-hidden="true" />
        </Button>
      </div>

      {hint && <p className="text-sm text-ink-muted">{hint}</p>}
    </div>
  );
}
