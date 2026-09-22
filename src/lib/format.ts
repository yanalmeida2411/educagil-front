import type { CourseLevel, CourseStatus, LessonType } from '@/types/api';

/** "1h 25min", "45min", "—" quando não há duração cadastrada. */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '—';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

/** "12:05" — para o tempo de uma aula dentro da lista do player. */
export function formatClock(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00';

  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** "há 3 dias", "agora mesmo" — para comentários e atividade recente. */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const diffSeconds = Math.round((Date.now() - date.getTime()) / 1000);

  if (diffSeconds < 60) return 'agora mesmo';

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ];

  const formatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffSeconds) >= secondsInUnit) {
      return formatter.format(-Math.round(diffSeconds / secondsInUnit), unit);
    }
  }

  return 'agora mesmo';
}

/** Percentual inteiro, sempre entre 0 e 100. */
export function formatPercent(value: number): string {
  return `${Math.min(100, Math.max(0, Math.round(value)))}%`;
}

/** "4,5" — nota média no padrão brasileiro. */
export function formatRating(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** "1,2 mil alunos" — números grandes sem poluir o card. */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  );
}

export const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  VIDEO: 'Vídeo',
  TEXT: 'Texto',
  PDF: 'Material',
  QUIZ: 'Quiz',
};

export const STATUS_LABELS = {
  DRAFT: 'Rascunho',
  PENDING_REVIEW: 'Em revisão',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Arquivado',
  ACTIVE: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  BLOCKED: 'Bloqueado',
} as const;

/** Cor do badge de cada status de curso, usada em cards e tabelas. */
export const COURSE_STATUS_TONES: Record<CourseStatus, 'neutral' | 'brand' | 'success' | 'warning'> = {
  DRAFT: 'neutral',
  PENDING_REVIEW: 'warning',
  PUBLISHED: 'success',
  ARCHIVED: 'neutral',
};

export const ROLE_LABELS = {
  STUDENT: 'Aluno',
  TEACHER: 'Professor',
  ADMIN: 'Administrador',
} as const;

/** Iniciais para o avatar de fallback: "Ana Souza" -> "AS". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();

  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}
