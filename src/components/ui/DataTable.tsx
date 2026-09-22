'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { EmptyState, TableSkeleton } from './Feedback';

export interface Column<T> {
  /** Chave estável da coluna; não precisa existir em T. */
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  /** Colunas secundárias somem no mobile em vez de espremer a tabela. */
  hideOnMobile?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Array<Column<T>>;
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; href?: string; onClick?: () => void };
  caption?: string;
  className?: string;
}

const ALIGN = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

/**
 * Tabela dos painéis de professor e admin.
 *
 * O contêiner rola na horizontal quando necessário, para a página nunca
 * ganhar barra de rolagem lateral por causa da tabela.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyTitle = 'Nada por aqui ainda',
  emptyDescription,
  emptyAction,
  caption,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return <TableSkeleton rows={5} columns={columns.length} />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
    );
  }

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-xl border border-border-subtle bg-surface',
        className,
      )}
    >
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}

        <thead>
          <tr className="border-b border-border-subtle bg-surface-muted/60">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-4 py-3 font-semibold text-ink-muted',
                  ALIGN[column.align ?? 'left'],
                  column.hideOnMobile && 'hidden md:table-cell',
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-border-subtle last:border-b-0 transition-colors hover:bg-surface-muted/40"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-ink',
                    ALIGN[column.align ?? 'left'],
                    column.hideOnMobile && 'hidden md:table-cell',
                    column.className,
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
