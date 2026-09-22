import type { ReactNode } from 'react';

/**
 * Renderizador mínimo do conteúdo textual das aulas.
 *
 * Suporta o subconjunto de Markdown que o editor do professor produz:
 * títulos (## e ###), listas (-), blocos de código (```) e parágrafos, além
 * de **negrito** e `código` inline. Tudo vira elemento React — nunca
 * dangerouslySetInnerHTML —, então um conteúdo malicioso não injeta HTML.
 */
type Block =
  | { kind: 'h2' | 'h3' | 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'code'; text: string };

function parse(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) blocks.push({ kind: 'p', text: paragraph.join(' ') });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length > 0) blocks.push({ kind: 'ul', items: list });
    list = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      flushParagraph();
      flushList();
      const code: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? '').trim().startsWith('```')) {
        code.push(lines[i] ?? '');
        i++;
      }
      blocks.push({ kind: 'code', text: code.join('\n') });
      continue;
    }

    if (trimmed === '') {
      flushParagraph();
      flushList();
    } else if (trimmed.startsWith('### ')) {
      flushParagraph();
      flushList();
      blocks.push({ kind: 'h3', text: trimmed.slice(4) });
    } else if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      flushParagraph();
      flushList();
      blocks.push({ kind: 'h2', text: trimmed.replace(/^#{1,2}\s/, '') });
    } else if (/^[-*]\s/.test(trimmed)) {
      flushParagraph();
      list.push(trimmed.slice(2));
    } else {
      flushList();
      paragraph.push(trimmed);
    }
  }

  flushParagraph();
  flushList();
  return blocks;
}

/** **negrito** e `código` dentro de uma linha. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={index} className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function RichText({ source }: { source: string }) {
  return (
    <div className="flex max-w-3xl flex-col gap-4 leading-relaxed text-ink">
      {parse(source).map((block, index) => {
        switch (block.kind) {
          case 'h2':
            return (
              <h2 key={index} className="mt-2 text-2xl font-bold">
                {inline(block.text)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={index} className="mt-1 text-lg font-semibold">
                {inline(block.text)}
              </h3>
            );
          case 'ul':
            return (
              <ul key={index} className="list-disc space-y-1.5 pl-6">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{inline(item)}</li>
                ))}
              </ul>
            );
          case 'code':
            return (
              <pre key={index} className="overflow-x-auto rounded-lg bg-ink p-4 font-mono text-sm text-white">
                <code>{block.text}</code>
              </pre>
            );
          default:
            return <p key={index}>{inline(block.text)}</p>;
        }
      })}
    </div>
  );
}
