import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Printer, Copy, Check, FileText, Eye, Code, FileType } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { StyledDocumentContent } from './StyledDocumentContent';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DocumentPreviewProps {
  content: string;
  templateName: string;
  onBack: () => void;
  onReset: () => void;
}

export const DocumentPreview = ({ content, templateName, onBack, onReset }: DocumentPreviewProps) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'styled' | 'raw'>('styled');
  const contentRef = useRef<HTMLPreElement>(null);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: 'Copié !',
        description: 'Le document a été copié dans le presse-papiers.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le document.',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${templateName}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              padding: 40px;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
            }
            pre {
              white-space: pre-wrap;
              font-family: inherit;
            }
          </style>
        </head>
        <body>
          <pre>${content}</pre>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${templateName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Téléchargé !',
      description: 'Le document texte a été téléchargé.',
    });
  };

  const handleDownloadWord = async () => {
    setIsGenerating(true);
    
    try {
      const lines = content.split('\n');
      const paragraphs: Paragraph[] = [];

      // Header
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'DOCUMENT JURIDIQUE',
              bold: true,
              size: 32,
              color: '1E293B',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: templateName.toUpperCase(),
              bold: true,
              size: 24,
              color: 'D4AF37',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Date: ${new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}`,
              size: 20,
              color: '666666',
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 400 },
        }),
        new Paragraph({
          border: {
            bottom: { color: 'D4AF37', size: 6, style: BorderStyle.SINGLE },
          },
          spacing: { after: 400 },
        })
      );

      // Content
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        
        if (trimmedLine === '') {
          paragraphs.push(new Paragraph({ spacing: { after: 200 } }));
        } else if (trimmedLine.match(/^[A-ZÉÈÊËÀÂÄÎÏÔÖÛÜÇ\s\-:]+$/) && trimmedLine.length > 3) {
          // Title (all caps)
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                  bold: true,
                  size: 26,
                  color: '1E293B',
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 300, after: 200 },
            })
          );
        } else if (trimmedLine.toLowerCase().startsWith('article')) {
          // Article heading
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                  bold: true,
                  size: 24,
                  color: 'D4AF37',
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 },
            })
          );
        } else if (trimmedLine.includes(':') && trimmedLine.indexOf(':') < 30) {
          // Label with value
          const colonIndex = trimmedLine.indexOf(':');
          const label = trimmedLine.substring(0, colonIndex + 1);
          const value = trimmedLine.substring(colonIndex + 1);
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: label,
                  bold: true,
                  size: 22,
                }),
                new TextRun({
                  text: value,
                  size: 22,
                }),
              ],
              spacing: { after: 100 },
            })
          );
        } else {
          // Normal paragraph
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedLine,
                  size: 22,
                }),
              ],
              spacing: { after: 100 },
            })
          );
        }
      });

      // Footer
      paragraphs.push(
        new Paragraph({
          border: {
            top: { color: 'D4AF37', size: 6, style: BorderStyle.SINGLE },
          },
          spacing: { before: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Document généré automatiquement - Usage professionnel',
              italics: true,
              size: 18,
              color: '888888',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
        })
      );

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440,
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${templateName.replace(/\s+/g, '_')}.docx`);

      toast({
        title: 'Word Généré !',
        description: 'Le document Word a été téléchargé.',
      });
    } catch (error) {
      console.error('Word generation error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le document Word.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      const headerHeight = 35;
      const footerHeight = 15;
      const contentStartY = margin + headerHeight;
      const maxContentHeight = pageHeight - contentStartY - footerHeight - margin;

      const drawHeader = (pageNum: number, totalPages: number) => {
        pdf.setFillColor(30, 41, 59);
        pdf.rect(0, 0, pageWidth, headerHeight + 10, 'F');
        
        pdf.setFillColor(212, 175, 55);
        pdf.rect(0, headerHeight + 8, pageWidth, 2, 'F');

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DOCUMENT JURIDIQUE', margin, 18);

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(templateName.toUpperCase(), margin, 28);

        const currentDate = new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
        pdf.setFontSize(9);
        pdf.setTextColor(180, 180, 180);
        const dateWidth = pdf.getTextWidth(currentDate);
        pdf.text(currentDate, pageWidth - margin - dateWidth, 18);

        const pageText = `Page ${pageNum}/${totalPages}`;
        const pageTextWidth = pdf.getTextWidth(pageText);
        pdf.text(pageText, pageWidth - margin - pageTextWidth, 28);
      };

      const drawFooter = () => {
        const footerY = pageHeight - footerHeight;
        
        pdf.setDrawColor(212, 175, 55);
        pdf.setLineWidth(0.5);
        pdf.line(margin, footerY, pageWidth - margin, footerY);

        pdf.setTextColor(120, 120, 120);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text(
          'Document généré automatiquement - Usage professionnel',
          margin,
          footerY + 8
        );

        const confText = 'CONFIDENTIEL';
        const confWidth = pdf.getTextWidth(confText);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 41, 59);
        pdf.text(confText, pageWidth - margin - confWidth, footerY + 8);
      };

      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(10);
      pdf.setFont('times', 'normal');

      const lines = content.split('\n');
      const processedLines: string[] = [];

      lines.forEach((line) => {
        if (line.trim() === '') {
          processedLines.push('');
        } else {
          const wrapped = pdf.splitTextToSize(line, contentWidth);
          processedLines.push(...wrapped);
        }
      });

      const lineHeight = 5;
      const linesPerPage = Math.floor(maxContentHeight / lineHeight);
      const totalPages = Math.ceil(processedLines.length / linesPerPage);

      let currentLine = 0;
      let pageNum = 1;

      while (currentLine < processedLines.length) {
        if (pageNum > 1) {
          pdf.addPage();
        }

        drawHeader(pageNum, totalPages);
        drawFooter();

        pdf.setTextColor(30, 30, 30);
        pdf.setFontSize(10);
        pdf.setFont('times', 'normal');

        let y = contentStartY + 10;
        const endLine = Math.min(currentLine + linesPerPage, processedLines.length);

        for (let i = currentLine; i < endLine; i++) {
          const line = processedLines[i];
          
          if (line.match(/^[A-ZÉÈÊËÀÂÄÎÏÔÖÛÜÇ\s\-:]+$/) && line.length > 3) {
            pdf.setFont('times', 'bold');
            pdf.setFontSize(11);
          } else if (line.includes(':') && line.indexOf(':') < 30) {
            pdf.setFont('times', 'bold');
            pdf.setFontSize(10);
          } else {
            pdf.setFont('times', 'normal');
            pdf.setFontSize(10);
          }

          pdf.text(line, margin, y);
          y += lineHeight;
        }

        currentLine = endLine;
        pageNum++;
      }

      pdf.save(`${templateName.replace(/\s+/g, '_')}.pdf`);

      toast({
        title: 'PDF Généré !',
        description: 'Le document PDF professionnel a été téléchargé.',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground">
              Document Généré
            </h2>
            <p className="text-sm text-muted-foreground">{templateName}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copié' : 'Copier'}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadTxt}>
            <FileText className="h-4 w-4" />
            TXT
          </Button>
          
          {/* Download dropdown for PDF/Word choice */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="gold" 
                size="sm" 
                disabled={isGenerating}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isGenerating ? 'Génération...' : 'Télécharger'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleDownloadPdf} className="gap-2 cursor-pointer">
                <FileType className="h-4 w-4 text-red-500" />
                <span>Format PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadWord} className="gap-2 cursor-pointer">
                <FileType className="h-4 w-4 text-blue-500" />
                <span>Format Word (.docx)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-2">
        <div className="flex gap-1">
          <Button
            variant={viewMode === 'styled' ? 'navy' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('styled')}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Vue stylisée
          </Button>
          <Button
            variant={viewMode === 'raw' ? 'navy' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('raw')}
            className="gap-2"
          >
            <Code className="h-4 w-4" />
            Texte brut
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-4 w-4 text-gold" />
          <span>PDF et Word conservent le style professionnel</span>
        </div>
      </div>

      {/* Document preview */}
      <div className="max-h-[650px] overflow-auto">
        {viewMode === 'styled' ? (
          <StyledDocumentContent content={content} templateName={templateName} />
        ) : (
          <div className="rounded-xl border-2 border-border bg-card shadow-lg">
            <div className="border-b border-border bg-muted/50 px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive/50" />
                <div className="h-3 w-3 rounded-full bg-gold/50" />
                <div className="h-3 w-3 rounded-full bg-green-500/50" />
                <span className="ml-4 text-sm text-muted-foreground">{templateName}</span>
              </div>
            </div>
            <div className="p-8">
              <pre
                ref={contentRef}
                className="whitespace-pre-wrap font-body text-sm leading-relaxed text-foreground"
              >
                {content}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onBack}>
          Modifier les informations
        </Button>
        <Button variant="navy" onClick={onReset}>
          Créer un nouveau document
        </Button>
      </div>
    </div>
  );
};