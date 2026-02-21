import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Worker local (pdfjs-dist v5)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface SecurePdfViewerProps {
  url: string;
  watermark?: boolean;
}

export function SecurePdfViewer({ url, watermark = true }: SecurePdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        const pdf = await pdfjsLib.getDocument(url).promise;
        if (cancelled) return;

        if (!containerRef.current) return;
        containerRef.current.innerHTML = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) break;

          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const wrapper = document.createElement('div');
          wrapper.style.position = 'relative';
          wrapper.style.width = '100%';
          wrapper.style.marginBottom = '8px';

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = '100%';
          canvas.style.display = 'block';

          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx, viewport }).promise;
          if (cancelled) break;

          // Filigrane sur le canvas
          if (watermark) {
            ctx.save();
            ctx.globalAlpha = 0.12;
            ctx.font = `bold ${Math.round(viewport.width / 8)}px Arial`;
            ctx.fillStyle = '#CC0000';
            ctx.translate(viewport.width / 2, viewport.height / 2);
            ctx.rotate(-Math.PI / 5);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('APERÇU', 0, -40);
            ctx.font = `bold ${Math.round(viewport.width / 14)}px Arial`;
            ctx.fillText('PAIEMENT REQUIS', 0, 40);
            ctx.restore();
          }

          wrapper.appendChild(canvas);
          if (containerRef.current && !cancelled) {
            containerRef.current.appendChild(wrapper);
          }
        }

        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error('SecurePdfViewer error:', err);
          setError('Impossible de charger le document.');
          setLoading(false);
        }
      }
    };

    loadPdf();
    return () => { cancelled = true; };
  }, [url, watermark]);

  return (
    <div className="w-full" style={{ userSelect: 'none' }} onContextMenu={(e) => e.preventDefault()}>
      {loading && (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm text-muted-foreground">Chargement du document...</p>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
