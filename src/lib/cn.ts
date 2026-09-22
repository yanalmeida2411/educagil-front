/**
 * Junta classes condicionais, descartando falsy.
 *
 * Não faz merge de conflitos do Tailwind (como o `tailwind-merge`): os
 * componentes deste design system recebem `className` por último na ordem de
 * concatenação, e a cascata do CSS resolve o resto. Manter simples evita uma
 * dependência só para isso.
 */
/**
 * Aceita os falsy que aparecem naturalmente em `cond && 'classe'` — incluindo
 * `0` e `''`, que surgem quando a condição é um número ou uma string.
 */
export type ClassValue = string | number | bigint | boolean | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter((value): value is string => typeof value === 'string' && value !== '').join(' ');
}
