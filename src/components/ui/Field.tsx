'use client';

import { forwardRef, useId } from 'react';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/cn';

interface FieldShellProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor: string;
  children: ReactNode;
  className?: string;
}

/**
 * Moldura comum de rótulo, dica e erro.
 *
 * A mensagem de erro usa `role="alert"` para ser anunciada assim que aparece,
 * e o input a referencia por `aria-describedby` — sem isso o leitor de tela
 * lê o campo sem nunca dizer o que está errado.
 */
function FieldShell({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-muted">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children}

      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${htmlFor}-hint`} className="text-sm text-ink-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

const CONTROL =
  'w-full rounded-lg border bg-surface px-3 text-ink placeholder:text-ink-subtle ' +
  'transition-colors outline-none disabled:bg-surface-muted disabled:text-ink-muted ' +
  'disabled:cursor-not-allowed';

function controlState(hasError: boolean, isValid?: boolean) {
  if (hasError) return 'border-danger focus:border-danger';
  if (isValid) return 'border-success focus:border-success';
  return 'border-border-subtle focus:border-brand-400';
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  /** Borda verde quando o campo já passou na validação. */
  valid?: boolean;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, valid, leftIcon, rightSlot, containerClassName, className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      htmlFor={inputId}
      className={containerClassName}
    >
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            CONTROL,
            'h-11',
            controlState(Boolean(error), valid),
            leftIcon && 'pl-10',
            rightSlot && 'pr-11',
            className,
          )}
          {...rest}
        />

        {rightSlot && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</span>
        )}
      </div>
    </FieldShell>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, containerClassName, className, id, rows = 4, ...rest },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      htmlFor={fieldId}
      className={containerClassName}
    >
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(CONTROL, 'resize-y py-2.5', controlState(Boolean(error)), className)}
        {...rest}
      />
    </FieldShell>
  );
});

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, placeholder, containerClassName, className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      htmlFor={fieldId}
      className={containerClassName}
    >
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={cn(
            CONTROL,
            'h-11 cursor-pointer appearance-none pr-9',
            controlState(Boolean(error)),
            className,
          )}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </FieldShell>
  );
});

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  hint?: string;
}

export function Checkbox({ label, hint, id, className, ...rest }: CheckboxProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="flex items-start gap-2.5">
      <input
        id={fieldId}
        type="checkbox"
        className={cn(
          'mt-0.5 size-4 shrink-0 cursor-pointer rounded border-border-subtle accent-brand-400',
          className,
        )}
        {...rest}
      />
      <div className="flex flex-col">
        <label htmlFor={fieldId} className="cursor-pointer text-sm font-medium text-ink">
          {label}
        </label>
        {hint && <span className="text-sm text-ink-muted">{hint}</span>}
      </div>
    </div>
  );
}
