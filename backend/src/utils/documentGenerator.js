import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import {
  documentGenerators,
  generateStatutsSARL,
  generateContratBail,
  generateDSV,
  generateListeGerants,
  generateDeclarationHonneur,
  generateFormulaireCEPICI
} from './documentTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GENERATED_DIR = path.join(__dirname, '../../generated');

const ensureGeneratedDir = () => {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
};

const safeFilePart = (value) => {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
};

/**
 * Convertir le contenu texte en document Word (.docx)
 */
const generateWordDocument = async (content, templateName, outputPath) => {
  const lines = content.split('\n');
  const paragraphs = [];

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
          text: 'Document généré automatiquement par ARCH EXCELLENCE - Usage professionnel',
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

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
};

/**
 * Convertir le contenu texte en document PDF avec PDFKit
 */
const generatePdfDocument = async (content, templateName, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: templateName,
          Author: 'ARCH EXCELLENCE',
          Subject: 'Document juridique',
        }
      });
      
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header
      doc.rect(0, 0, doc.page.width, 60).fill('#1E293B');
      doc.rect(0, 58, doc.page.width, 2).fill('#D4AF37');
      
      doc.fillColor('#FFFFFF')
         .fontSize(18)
         .font('Helvetica-Bold')
         .text('DOCUMENT JURIDIQUE', 50, 20);
      
      doc.fontSize(11)
         .font('Helvetica')
         .text(templateName.toUpperCase(), 50, 40);
      
      const currentDate = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      doc.fontSize(9)
         .fillColor('#B4B4B4')
         .text(currentDate, doc.page.width - 200, 20, { align: 'right' });

      // Contenu
      doc.moveDown(3);
      doc.fillColor('#1E1E1E');
      doc.fontSize(10);
      doc.font('Times-Roman');

      const lines = content.split('\n');
      let y = 100;

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        
        if (trimmedLine === '') {
          doc.moveDown(0.5);
          y += 5;
        } else if (trimmedLine.match(/^[A-ZÉÈÊËÀÂÄÎÏÔÖÛÜÇ\s\-:]+$/) && trimmedLine.length > 3 && !trimmedLine.includes(':')) {
          // Titre (tout en majuscules)
          if (y > doc.page.height - 100) {
            doc.addPage();
            y = 50;
          }
          doc.font('Times-Bold')
             .fontSize(12)
             .text(trimmedLine, 50, y, { width: doc.page.width - 100 });
          doc.moveDown(1);
          y += 15;
        } else if (trimmedLine.toLowerCase().startsWith('article')) {
          // Article
          if (y > doc.page.height - 100) {
            doc.addPage();
            y = 50;
          }
          doc.font('Times-Bold')
             .fontSize(11)
             .fillColor('#D4AF37')
             .text(trimmedLine, 50, y, { width: doc.page.width - 100 });
          doc.moveDown(0.5);
          y += 12;
        } else if (trimmedLine.includes(':') && trimmedLine.indexOf(':') < 30) {
          // Label avec valeur
          if (y > doc.page.height - 100) {
            doc.addPage();
            y = 50;
          }
          const colonIndex = trimmedLine.indexOf(':');
          const label = trimmedLine.substring(0, colonIndex + 1);
          const value = trimmedLine.substring(colonIndex + 1);
          
          doc.font('Times-Bold')
             .fontSize(10)
             .fillColor('#1E1E1E')
             .text(label, 50, y, { width: doc.page.width - 100, continued: true });
          doc.font('Times-Roman')
             .text(value);
          doc.moveDown(0.5);
          y += 8;
        } else {
          // Paragraphe normal
          if (y > doc.page.height - 100) {
            doc.addPage();
            y = 50;
          }
          doc.font('Times-Roman')
             .fontSize(10)
             .fillColor('#1E1E1E')
             .text(trimmedLine, 50, y, { 
               width: doc.page.width - 100,
               align: 'left'
             });
          doc.moveDown(0.5);
          y += 8;
        }
      });

      // Footer sur chaque page
      doc.on('pageAdded', () => {
        const pageNum = doc.bufferedPageRange().count;
        doc.switchToPage(pageNum - 1);
        
        const footerY = doc.page.height - 30;
        doc.strokeColor('#D4AF37')
           .lineWidth(0.5)
           .moveTo(50, footerY)
           .lineTo(doc.page.width - 50, footerY)
           .stroke();
        
        doc.fontSize(8)
           .font('Helvetica-Oblique')
           .fillColor('#787878')
           .text(
             'Document généré automatiquement par ARCH EXCELLENCE - Usage professionnel',
             50,
             footerY + 5,
             { width: doc.page.width - 100, align: 'center' }
           );
        
        doc.font('Helvetica-Bold')
           .fillColor('#1E293B')
           .text('CONFIDENTIEL', doc.page.width - 150, footerY + 5, { align: 'right' });
      });

      // Footer sur la dernière page
      const footerY = doc.page.height - 30;
      doc.strokeColor('#D4AF37')
         .lineWidth(0.5)
         .moveTo(50, footerY)
         .lineTo(doc.page.width - 50, footerY)
         .stroke();
      
      doc.fontSize(8)
         .font('Helvetica-Oblique')
         .fillColor('#787878')
         .text(
           'Document généré automatiquement par ARCH EXCELLENCE - Usage professionnel',
           50,
           footerY + 5,
           { width: doc.page.width - 100, align: 'center' }
         );
      
      doc.font('Helvetica-Bold')
         .fillColor('#1E293B')
         .text('CONFIDENTIEL', doc.page.width - 150, footerY + 5, { align: 'right' });

      doc.end();

      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Générer un document (Word et PDF) à partir d'un template
 * @param {string} docName - Nom du document
 * @param {Object} company - Données de l'entreprise
 * @param {Array} associates - Liste des associés
 * @param {Array} managers - Liste des gérants
 * @param {Object} additionalData - Données supplémentaires (bailleur, etc.)
 * @param {Object} options - Options (formats: ['pdf', 'docx'] ou ['pdf'] ou ['docx'])
 * @returns {Promise<Object>} - { pdf: {fileName, filePath}, docx: {fileName, filePath} }
 */
export const generateDocument = async (docName, company, associates = [], managers = [], additionalData = {}, options = { formats: ['pdf', 'docx'] }) => {
  ensureGeneratedDir();

  // Trouver le générateur approprié
  const generator = documentGenerators[docName] || 
                    documentGenerators[docName.toLowerCase()] ||
                    null;

  if (!generator) {
    throw new Error(`Template non trouvé pour le document: ${docName}`);
  }

  // Générer le contenu texte
  let content;
  if (docName.includes('Statuts') || docName.includes('statuts')) {
    content = generateStatutsSARL(company, associates, managers);
  } else if (docName.includes('Bail') || docName.includes('bail')) {
    content = generateContratBail(company, additionalData);
  } else if (docName.includes('DSV') || docName.includes('Souscription')) {
    content = generateDSV(company, associates);
  } else if (docName.includes('Gérant') || docName.includes('gérant') || docName.includes('dirigeant')) {
    content = generateListeGerants(company, managers);
  } else if (docName.includes('Déclaration') || docName.includes('déclaration')) {
    content = generateDeclarationHonneur(company, managers);
  } else if (docName.includes('CEPICI') || docName.includes('cepici')) {
    content = generateFormulaireCEPICI(company, managers, associates);
  } else {
    content = generator(company, associates, managers, additionalData);
  }

  const baseFileName = safeFilePart(docName);
  const timestamp = Date.now();
  const result = {};

  // Générer PDF
  if (options.formats.includes('pdf')) {
    const pdfFileName = `${baseFileName}_${timestamp}.pdf`;
    const pdfPath = path.join(GENERATED_DIR, pdfFileName);
    await generatePdfDocument(content, docName, pdfPath);
    result.pdf = {
      fileName: pdfFileName,
      filePath: pdfPath,
      mimeType: 'application/pdf'
    };
  }

  // Générer Word
  if (options.formats.includes('docx')) {
    const docxFileName = `${baseFileName}_${timestamp}.docx`;
    const docxPath = path.join(GENERATED_DIR, docxFileName);
    await generateWordDocument(content, docName, docxPath);
    result.docx = {
      fileName: docxFileName,
      filePath: docxPath,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
  }

  return result;
};

/**
 * Générer plusieurs documents en une fois
 */
export const generateMultipleDocuments = async (docNames, company, associates = [], managers = [], additionalData = {}, options = { formats: ['pdf', 'docx'] }) => {
  const results = [];
  
  for (const docName of docNames) {
    try {
      const result = await generateDocument(docName, company, associates, managers, additionalData, options);
      results.push({
        docName,
        ...result
      });
    } catch (error) {
      console.error(`Erreur génération ${docName}:`, error);
      results.push({
        docName,
        error: error.message
      });
    }
  }
  
  return results;
};

