'use client';

import { useEffect, useRef, useState } from 'react';
import { LuExternalLink } from 'react-icons/lu';

type VideoSource =
  | { kind: 'embed'; provider: 'youtube' | 'vimeo'; src: string }
  | { kind: 'file'; src: string }
  | { kind: 'external'; src: string };

/**
 * Converte a URL cadastrada pelo professor numa forma reproduzível.
 * Não há hospedagem própria de vídeo nesta versão: aceitamos YouTube, Vimeo
 * e arquivos diretos; qualquer outra URL vira um link externo.
 */
export function resolveVideo(url: string): VideoSource {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = parsed.searchParams.get('v') ?? parsed.pathname.split('/embed/')[1];
      if (id) return { kind: 'embed', provider: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}?rel=0` };
    }

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1);
      if (id) return { kind: 'embed', provider: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}?rel=0` };
    }

    if (host === 'vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) return { kind: 'embed', provider: 'vimeo', src: `https://player.vimeo.com/video/${id}` };
    }

    if (/\.(mp4|webm|ogg)$/i.test(parsed.pathname)) {
      return { kind: 'file', src: url };
    }
  } catch {
    // URL malformada: cai no link externo abaixo.
  }

  return { kind: 'external', src: url };
}

/** Só vale retomar se o aluno passou do começo; alguns segundos antes, para dar contexto. */
function resumePoint(startAt: number): number {
  return startAt > 10 ? Math.floor(startAt - 3) : 0;
}

/** Acrescenta a retomada e a API de mensagens à URL do embed. */
function embedUrl(source: Extract<VideoSource, { kind: 'embed' }>, startAt: number): string {
  const start = resumePoint(startAt);

  if (source.provider === 'youtube') {
    const url = new URL(source.src);
    url.searchParams.set('enablejsapi', '1');
    url.searchParams.set('origin', window.location.origin);
    if (start > 0) url.searchParams.set('start', String(start));
    return url.toString();
  }

  return start > 0 ? `${source.src}#t=${start}s` : source.src;
}

function parseMessage(data: unknown): Record<string, unknown> | null {
  if (typeof data === 'object' && data !== null) return data as Record<string, unknown>;
  if (typeof data !== 'string') return null;
  try {
    const parsed: unknown = JSON.parse(data);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

interface VideoPlayerProps {
  url: string;
  title: string;
  /** Posição salva, em segundos, de onde o vídeo deve retomar. */
  startAt?: number;
  /** Chamado com a posição atual enquanto o vídeo toca. */
  onProgress?: (seconds: number) => void;
}

export function VideoPlayer({ url, title, startAt = 0, onProgress }: VideoPlayerProps) {
  const source = resolveVideo(url);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  // A retomada só vale na montagem: recalcular a URL a cada progresso salvo
  // recarregaria o iframe no meio da aula.
  const [initialStart] = useState(startAt);
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);

  const provider = source.kind === 'embed' ? source.provider : null;

  useEffect(() => {
    if (source.kind === 'embed') setEmbedSrc(embedUrl(source, initialStart));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a URL do embed depende só da URL da aula
  }, [url, initialStart]);

  // Embeds não expõem o tempo diretamente: YouTube e Vimeo publicam a posição
  // por postMessage depois que o player é inscrito para ouvir.
  useEffect(() => {
    if (!provider) return;

    const post = (message: unknown) => {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify(message), '*');
    };

    const onMessage = (event: MessageEvent) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
      const data = parseMessage(event.data);
      if (!data) return;

      if (provider === 'youtube') {
        const info = data.info as { currentTime?: unknown } | undefined;
        if (data.event === 'infoDelivery' && typeof info?.currentTime === 'number') {
          onProgressRef.current?.(info.currentTime);
        }
        return;
      }

      if (data.event === 'ready') {
        post({ method: 'addEventListener', value: 'timeupdate' });
      } else if (data.event === 'timeupdate') {
        const seconds = (data.data as { seconds?: unknown } | undefined)?.seconds;
        if (typeof seconds === 'number') onProgressRef.current?.(seconds);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [provider, embedSrc]);

  function subscribeEmbed() {
    // O YouTube só passa a enviar `infoDelivery` depois deste aviso.
    if (provider === 'youtube') {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }),
        '*',
      );
    }
  }

  if (source.kind === 'external') {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-xl bg-ink text-center text-white">
        <div className="flex flex-col items-center gap-3 p-6">
          <p>Este vídeo é reproduzido no site de origem.</p>
          <a
            href={source.src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-semibold text-ink"
          >
            Abrir vídeo <LuExternalLink aria-hidden="true" />
          </a>
        </div>
      </div>
    );
  }

  if (source.kind === 'file') {
    return (
      <video
        key={source.src}
        src={source.src}
        controls
        preload="metadata"
        className="aspect-video w-full rounded-xl bg-ink"
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          const start = resumePoint(initialStart);
          // Perto do fim, recomeçar faz mais sentido do que abrir nos créditos.
          if (start > 0 && start < video.duration - 10) video.currentTime = start;
        }}
        onTimeUpdate={(event) => onProgressRef.current?.(event.currentTarget.currentTime)}
      >
        Seu navegador não reproduz este vídeo.
      </video>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-ink">
      {embedSrc && (
        <iframe
          ref={iframeRef}
          key={embedSrc}
          src={embedSrc}
          title={title}
          className="size-full"
          onLoad={subscribeEmbed}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </div>
  );
}
