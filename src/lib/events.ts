/**
 * Eventos de janela para sincronizar partes da interface que não
 * compartilham estado — por exemplo, a página de notificações avisando o
 * sino da navbar que o contador mudou.
 */
export const NOTIFICATIONS_CHANGED = 'educagil:notifications-changed';

export function emitNotificationsChanged(): void {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
}
