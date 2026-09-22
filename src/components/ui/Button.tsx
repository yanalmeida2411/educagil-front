import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold ' +
  'transition-colors duration-150 whitespace-nowrap ' +
  'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-400 text-white hover:bg-brand-500 active:bg-brand-600',
  secondary: 'bg-brand-50 text-brand-600 hover:bg-brand-100 active:bg-brand-200',
  outline:
    'border border-border-subtle bg-surface text-ink hover:bg-surface-muted hover:border-brand-300',
  ghost: 'text-ink-muted hover:bg-surface-muted hover:text-brand-500',
  danger: 'bg-danger text-white hover:bg-danger-soft',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-12 px-6 text-base',
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Mostra spinner e desabilita o clique. */
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export interface ButtonProps
  extends CommonProps,
    ButtonHTMLAttributes<HTMLButtonElement> {}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

function content(props: CommonProps & { children?: ReactNode }) {
  const { loading, leftIcon, rightIcon, children } = props;

  return (
    <>
      {loading ? <Spinner /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className,
    disabled,
    type = 'button',
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      // Sem type explícito um botão dentro de <form> submete por engano.
      type={type}
      disabled={disabled || loading}
      // Comunica o estado de carregamento a leitores de tela.
      aria-busy={loading || undefined}
      className={cn(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        'cursor-pointer',
        className,
      )}
      {...rest}
    >
      {content({ loading, leftIcon, rightIcon, children })}
    </button>
  );
});

export interface ButtonLinkProps extends CommonProps {
  href: string;
  className?: string;
  children?: ReactNode;
  'aria-label'?: string;
}

/** Mesmo visual do Button, mas navega — mantém a semântica de link. */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}
