import { useMemo } from 'react';
import { FileText, Calendar, Shield } from 'lucide-react';

interface StyledDocumentContentProps {
  content: string;
  templateName: string;
}

interface ParsedLine {
  type: 'title' | 'subtitle' | 'separator' | 'article' | 'signature' | 'paragraph' | 'empty';
  content: string;
}

export const StyledDocumentContent = ({ content, templateName }: StyledDocumentContentProps) => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const parsedLines = useMemo(() => {
    const lines = content.split('\n');
    const result: ParsedLine[] = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      if (trimmedLine === '') {
        result.push({ type: 'empty', content: '' });
      } else if (/^[═─━┈┄]+$/.test(trimmedLine) || /^[-=_]{3,}$/.test(trimmedLine)) {
        result.push({ type: 'separator', content: trimmedLine });
      } else if (/^(ARTICLE|Article|TITRE|Titre|CHAPITRE|Chapitre)\s*\d*/i.test(trimmedLine)) {
        result.push({ type: 'article', content: trimmedLine });
      } else if (
        /^[A-ZÉÈÊËÀÂÄÎÏÔÖÛÜÇÙ\s\-:()0-9]+$/.test(trimmedLine) &&
        trimmedLine.length > 3 &&
        trimmedLine.length < 80
      ) {
        result.push({ type: 'title', content: trimmedLine });
      } else if (
        (trimmedLine.endsWith(':') && trimmedLine.length < 60) ||
        /^[\d]+[.)\-]/.test(trimmedLine)
      ) {
        result.push({ type: 'subtitle', content: trimmedLine });
      } else if (
        /signature|signé|fait à|le présent|en foi de quoi/i.test(trimmedLine) ||
        /^lu et approuvé/i.test(trimmedLine)
      ) {
        result.push({ type: 'signature', content: trimmedLine });
      } else {
        result.push({ type: 'paragraph', content: line });
      }
    });

    return result;
  }, [content]);

  const renderLine = (line: ParsedLine, index: number) => {
    switch (line.type) {
      case 'empty':
        return <div key={index} className="h-4" />;

      case 'separator':
        return (
          <div key={index} className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <div className="h-1.5 w-1.5 rotate-45 bg-gold" />
            <div className="h-px flex-1 bg-gradient-to-r from-gold via-gold to-transparent" />
          </div>
        );

      case 'title':
        return (
          <h2
            key={index}
            className="mb-4 mt-8 border-b-2 border-gold/30 pb-2 font-heading text-xl font-bold tracking-wide text-navy first:mt-0"
          >
            {line.content}
          </h2>
        );

      case 'article':
        return (
          <h3
            key={index}
            className="mb-3 mt-6 flex items-center gap-2 font-heading text-lg font-semibold text-navy-light"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-gold" />
            {line.content}
          </h3>
        );

      case 'subtitle':
        return (
          <h4
            key={index}
            className="mb-2 mt-4 font-body text-base font-semibold text-foreground"
          >
            {line.content}
          </h4>
        );

      case 'signature':
        return (
          <div
            key={index}
            className="my-4 rounded-lg border border-dashed border-gold/40 bg-gold/5 px-6 py-4 font-body text-sm italic text-muted-foreground"
          >
            {line.content}
          </div>
        );

      case 'paragraph':
      default:
        return (
          <p
            key={index}
            className="mb-2 font-body text-sm leading-relaxed text-foreground/90"
          >
            {line.content}
          </p>
        );
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-border bg-gradient-to-b from-amber-50/50 to-white shadow-lg dark:from-navy-dark/20 dark:to-card">
      {/* Document Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-navy via-navy to-navy-light px-8 py-6">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border-4 border-gold" />
          <div className="absolute -right-4 top-4 h-16 w-16 rounded-full border-2 border-gold" />
        </div>

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gold/20 shadow-inner">
              <FileText className="h-7 w-7 text-gold" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-white">
                {templateName}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-white/70">
                <Calendar className="h-3.5 w-3.5" />
                {currentDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur-sm">
            <Shield className="h-4 w-4 text-gold" />
            <span className="text-xs font-medium uppercase tracking-wider text-white/80">
              Document Officiel
            </span>
          </div>
        </div>

        {/* Gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />
      </div>

      {/* Document Body */}
      <div className="relative px-10 py-8">
        {/* Margin lines decoration */}
        <div className="pointer-events-none absolute bottom-8 left-8 top-8 w-px bg-gradient-to-b from-gold/20 via-gold/10 to-gold/20" />

        {/* Content */}
        <div className="ml-4">
          {parsedLines.map((line, index) => renderLine(line, index))}
        </div>
      </div>

      {/* Document Footer */}
      <div className="border-t border-gold/20 bg-muted/30 px-8 py-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
            Document généré automatiquement
          </p>
          <p className="font-medium uppercase tracking-wider text-navy dark:text-gold">
            Confidentiel
          </p>
        </div>
      </div>
    </div>
  );
};
