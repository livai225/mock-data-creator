import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import htmlToDocx from 'html-to-docx';
import {
  documentGenerators,
  generateStatutsSARL,
  generateContratBail,
  generateDSV,
  generateListeGerants,
  generateDeclarationHonneur,
  generateFormulaireCEPICI
} from './documentTemplates.js';

// Import dynamique de puppeteerGenerator (sera chargé dans la fonction si nécessaire)
let puppeteerGenerator = null;

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

  lines.forEach((line) => {
    const trimmedLine = line.trimEnd();

    if (trimmedLine === '') {
      paragraphs.push(new Paragraph({ spacing: { after: 120 } }));
      return;
    }

    const isAllCaps = trimmedLine.match(/^[A-Z??????????????0-9\s\-:()'".,]+$/);
    const isArticle = trimmedLine.toLowerCase().startsWith('article');
    const hasLabel = trimmedLine.includes(':') && trimmedLine.indexOf(':') < 35;

    if (isAllCaps && trimmedLine.length > 3) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine,
              bold: true,
            }),
          ],
          spacing: { before: 120, after: 80 },
          alignment: trimmedLine.length < 40 ? AlignmentType.CENTER : AlignmentType.LEFT,
        })
      );
    } else if (isArticle) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine,
              bold: true,
            }),
          ],
          spacing: { before: 120, after: 80 },
        })
      );
    } else if (hasLabel) {
      const colonIndex = trimmedLine.indexOf(':');
      const label = trimmedLine.substring(0, colonIndex + 1);
      const value = trimmedLine.substring(colonIndex + 1);
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: label,
              bold: true,
            }),
            new TextRun({
              text: value,
            }),
          ],
          spacing: { after: 80 },
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine,
            }),
          ],
          spacing: { after: 80 },
        })
      );
    }
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 22,
            color: '000000',
          },
          paragraph: {
            spacing: { line: 276 },
          },
        },
      },
    },
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

      // Header simple en haut (format épuré comme image 4)
      const headerTitle = templateName.includes('Statuts') ? 'Statuts de la société' : 
                         templateName.includes('Bail') ? 'Contrat de bail' :
                         templateName.includes('CEPICI') ? 'Formulaire CEPICI' :
                         templateName.includes('Gérant') || templateName.includes('Dirigeant') ? 'Liste des dirigeants' :
                         templateName.includes('Déclaration') ? 'Déclaration sur l\'honneur' :
                         templateName.includes('DSV') ? 'Déclaration Souscription/Versement' :
                         templateName;
      
      doc.fillColor('#1E293B')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(headerTitle, 50, 20);
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Document 1 sur 1', 50, 35);

      // Contenu avec gestion intelligente de l'espacement et des sauts de page
      doc.fillColor('#1E1E1E');
      doc.fontSize(10);
      doc.font('Times-Roman');

      const lines = content.split('\n');
      const textWidth = doc.page.width - 100; // Largeur disponible pour le texte
      const lineHeight = 12; // Hauteur de ligne de base
      const minBottomMargin = 80; // Marge minimale en bas de page
      const topMargin = 70; // Marge en haut de page (après header simple)
      
      // Position initiale après le header simple
      doc.y = 70;
      
      // Détecter si c'est un document de statuts pour centrer le titre principal
      const isStatuts = templateName.toLowerCase().includes('statuts');
      
      // Extraire le nom de la société depuis le contenu pour le mettre en évidence
      const extractCompanyName = (content) => {
        // Chercher le nom de la société après "STATUTS" et "SOCIÉTÉ À RESPONSABILITÉ LIMITÉE"
        const contentLines = content.split('\n');
        let foundStatuts = false;
        let foundSociete = false;
        for (let i = 0; i < contentLines.length; i++) {
          const line = contentLines[i].trim();
          if (line.match(/^STATUTS$/i)) {
            foundStatuts = true;
          } else if (foundStatuts && line.match(/^SOCIÉTÉ À RESPONSABILITÉ LIMITÉE/i)) {
            foundSociete = true;
          } else if (foundSociete && line && !line.match(/^Sigle/i)) {
            return line.replace(/[«»"]/g, '').trim();
          }
        }
        return null;
      };
      
      const companyName = extractCompanyName(content);

      // Fonction helper pour vérifier et gérer les sauts de page
      const checkPageBreak = (requiredHeight) => {
        if (doc.y + requiredHeight > doc.page.height - minBottomMargin) {
          doc.addPage();
          doc.y = topMargin;
          return true;
        }
        return false;
      };

      // Fonction helper pour calculer la hauteur d'un texte
      const getTextHeight = (text, fontSize, width) => {
        const oldY = doc.y;
        const oldFont = doc._font;
        doc.fontSize(fontSize);
        const height = doc.heightOfString(text, { width, lineGap: 2 });
        doc.y = oldY; // Restaurer la position
        doc._font = oldFont; // Restaurer la police
        return height;
      };

      // Détecter si c'est le formulaire CEPICI pour un traitement spécial
      const isCEPICI = templateName.toLowerCase().includes('cepici');
      
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        
        if (trimmedLine === '') {
          // Ligne vide : espacement professionnel
          doc.y += 6;
        } else if (isCEPICI && trimmedLine.match(/^RÉPUBLIQUE DE CÔTE D'IVOIRE/i)) {
          // En-tête CEPICI - première ligne
          const fontSize = 10;
          const estimatedHeight = getTextHeight(trimmedLine, fontSize, textWidth) + 8;
          checkPageBreak(estimatedHeight);
          
          doc.font('Times-Bold')
             .fontSize(fontSize)
             .fillColor('#1E1E1E')
             .text(trimmedLine, 50, doc.y, { width: textWidth, align: 'center' });
          
          doc.y += 8;
        } else if (isCEPICI && trimmedLine.match(/^CEPICI$/i)) {
          // CEPICI centré en gras
          const fontSize = 14;
          const estimatedHeight = getTextHeight(trimmedLine, fontSize, textWidth) + 6;
          checkPageBreak(estimatedHeight);
          
          doc.font('Times-Bold')
             .fontSize(fontSize)
             .fillColor('#1E1E1E')
             .text(trimmedLine, 50, doc.y, { width: textWidth, align: 'center' });
          
          doc.y += 6;
        } else if (isCEPICI && trimmedLine.match(/^GUICHET UNIQUE/i)) {
          // GUICHET UNIQUE centré
          const fontSize = 10;
          const estimatedHeight = getTextHeight(trimmedLine, fontSize, textWidth) + 10;
          checkPageBreak(estimatedHeight);
          
          doc.font('Times-Bold')
             .fontSize(fontSize)
             .fillColor('#1E1E1E')
             .text(trimmedLine, 50, doc.y, { width: textWidth, align: 'center' });
          
          doc.y += 10;
        } else if (isCEPICI && trimmedLine.match(/^FORMULAIRE UNIQUE/i)) {
          // Titre principal CEPICI
          const fontSize = 12;
          const estimatedHeight = getTextHeight(trimmedLine, fontSize, textWidth) + 12;
          checkPageBreak(estimatedHeight);
          
          doc.font('Times-Bold')
             .fontSize(fontSize)
             .fillColor('#1E1E1E')
             .text(trimmedLine, 50, doc.y, { width: textWidth, align: 'center' });
          
          doc.y += 12;
        } else if (isCEPICI && trimmedLine.match(/^SECTION [A-Z]:/i)) {
          // Section CEPICI en gras
          const fontSize = 11;
          const estimatedHeight = getTextHeight(trimmedLine, fontSize, textWidth) + 8;
          checkPageBreak(estimatedHeight);
          
          doc.font('Times-Bold')
             .fontSize(fontSize)
             .fillColor('#1E1E1E')
             .text(trimmedLine, 50, doc.y, { width: textWidth });
          
          doc.y += 8;
        } else if (trimmedLine.match(/^STATUTS$/i) && isStatuts) {
          // Titre principal "STATUTS" centré en grand (format image 4)
          const fontSize = 24;
          const estimatedHeight = getTextHeight(trimmedLine, fontSize, textWidth) + 10;
          checkPageBreak(estimatedHeight);
          
          doc.font('Times-Bold')
             .fontSize(fontSize)
             .fillColor('#1E1E1E')
             .text(trimmedLine.toUpperCase(), { 
               width: doc.page.width - 100,
               align: 'center'
             });
          
          // PDFKit met à jour doc.y automatiquement, on ajoute juste l'espacement
          doc.y += 10;
        } else if (trimmedLine.match(/^SOCIÉTÉ À RESPONSABILITÉ LIMITÉE/i) && isStatuts) {
          // Sous-titre centré (format image 4)
          const fontSize = 14;
          const estimatedHeight = getTextHeight(trimmedLine, fontSize, textWidth) + 15;
          checkPageBreak(estimatedHeight);
          
          doc.font('Times-Bold')
             .fontSize(fontSize)
             .fillColor('#1E1E1E')
             .text(trimmedLine.toUpperCase(), { 
               width: doc.page.width - 100,
               align: 'center'
             });
          
          // PDFKit met à jour doc.y automatiquement, on ajoute juste l'espacement
          doc.y += 15;
        } else if (companyName && trimmedLine.trim().toUpperCase() === companyName.toUpperCase() && isStatuts) {
          // Nom de la société avec fond jaune (format image 4)
          const fontSize = 18;
          const textToDisplay = trimmedLine.toUpperCase();
          const textWidthMeasured = doc.widthOfString(textToDisplay, { fontSize });
          const textHeight = getTextHeight(textToDisplay, fontSize, textWidth);
          checkPageBreak(textHeight + 10);
          
          // Dessiner le fond jaune centré
          const padding = 10;
          const highlightX = (doc.page.width - textWidthMeasured) / 2 - padding;
          const highlightY = doc.y - 3;
          
          doc.rect(highlightX, highlightY, textWidthMeasured + (padding * 2), textHeight + 6)
             .fill('#FFEB3B');
          
          // Écrire le texte par-dessus
          doc.font('Times-Bold')
             .fontSize(fontSize)
             .fillColor('#1E1E1E')
             .text(textToDisplay, highlightX + padding, doc.y, { 
               width: textWidthMeasured
             });
          
          // Mettre à jour Y manuellement car on utilise une position X explicite
          doc.y += textHeight + 10;
        } else if (trimmedLine.match(/^Sigle/i) && isStatuts) {
          // Sigle centré (format image 4)
          const fontSize = 10;
          const estimatedHeight = getTextHeight(trimmedLine, fontSize, textWidth) + 23;
          checkPageBreak(estimatedHeight);
          
          doc.font('Times-Roman')
             .fontSize(fontSize)
             .fillColor('#1E1E1E')
             .text(trimmedLine, { 
               width: doc.page.width - 100,
               align: 'center'
             });
          
          // PDFKit met à jour doc.y automatiquement, on ajoute juste l'espacement
          doc.y += 8;
          
          // Ligne de séparation après le sigle (format image 4)
          const lineY = doc.y + 5;
          doc.strokeColor('#1E1E1E')
             .lineWidth(0.5)
             .moveTo(50, lineY)
             .lineTo(doc.page.width - 50, lineY)
             .stroke();
          
          doc.y += 15;
        } else if (trimmedLine.match(/^[A-ZÉÈÊËÀÂÄÎÏÔÖÛÜÇ\s\-:]+$/) && trimmedLine.length > 3 && !trimmedLine.includes(':')) {
          // Titre (tout en majuscules)
          const fontSize = 12;
          const estimatedHeight = getTextHeight(trimmedLine, fontSize, textWidth) + 8;
          checkPageBreak(estimatedHeight);
          
          doc.font('Times-Bold')
             .fontSize(fontSize)
             .fillColor('#1E1E1E')
             .text(trimmedLine, 50, doc.y, { width: textWidth });
          
          // PDFKit met à jour doc.y automatiquement quand on utilise width, on ajoute juste l'espacement
          doc.y += 8;
        } else if (trimmedLine.toLowerCase().startsWith('article')) {
          // Article
          const fontSize = 11;
          const estimatedHeight = getTextHeight(trimmedLine, fontSize, textWidth) + 6;
          checkPageBreak(estimatedHeight);
          
          doc.font('Times-Bold')
             .fontSize(fontSize)
             .fillColor('#D4AF37')
             .text(trimmedLine, 50, doc.y, { width: textWidth });
          
          // PDFKit met à jour doc.y automatiquement quand on utilise width, on ajoute juste l'espacement
          doc.y += 6;
        } else if (trimmedLine.includes(':') && trimmedLine.indexOf(':') < 30) {
          // Label avec valeur (format professionnel avec meilleur espacement)
          const colonIndex = trimmedLine.indexOf(':');
          const label = trimmedLine.substring(0, colonIndex + 1);
          const value = trimmedLine.substring(colonIndex + 1).trim();
          
          const fontSize = 10;
          const lineSpacing = 6; // Espacement entre les lignes
          const estimatedHeight = getTextHeight(trimmedLine, fontSize, textWidth) + lineSpacing;
          checkPageBreak(estimatedHeight);
          
          // Écrire le label en gras
          doc.font('Times-Bold')
             .fontSize(fontSize)
             .fillColor('#1E1E1E')
             .text(label, 50, doc.y, { width: textWidth, continued: true });
          
          // Écrire la valeur en normal
          if (value) {
            doc.font('Times-Roman')
               .fontSize(fontSize)
               .fillColor('#1E1E1E')
               .text(value, { width: textWidth });
          }
          
          // Espacement après le label/valeur
          doc.y += lineSpacing;
        } else {
          // Paragraphe normal (format professionnel avec meilleur espacement)
          const fontSize = 10;
          const lineSpacing = 5; // Espacement entre les paragraphes
          const estimatedHeight = getTextHeight(trimmedLine, fontSize, textWidth) + lineSpacing;
          checkPageBreak(estimatedHeight);
          
          doc.font('Times-Roman')
             .fontSize(fontSize)
             .fillColor('#1E1E1E')
             .text(trimmedLine, 50, doc.y, { 
               width: textWidth,
               align: 'left',
               lineGap: 2 // Espacement entre les lignes dans le paragraphe
             });
          
          // PDFKit met déjà à jour doc.y automatiquement, on ajoute juste l'espacement entre paragraphes
          doc.y += lineSpacing;
        }
      });

      // Footer sur la dernière page uniquement (pour éviter la récursion)
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
  console.log(`\n🔧 [generateDocument] Début génération: "${docName}"`);
  console.log(`   Formats demandés:`, options.formats);
  
  ensureGeneratedDir();

  // Trouver le générateur approprié
  const generator = documentGenerators[docName] || 
                    documentGenerators[docName.toLowerCase()] ||
                    null;

  console.log(`   Générateur trouvé dans documentGenerators:`, generator ? 'OUI' : 'NON');

  // Générer le contenu texte
  let content;
  try {
    // Si du contenu personnalisé est fourni, l'utiliser
    if (options.customContent) {
      console.log(`   📝 Utilisation du contenu personnalisé fourni`);
      content = options.customContent;
    } else if (docName.includes('Statuts') || docName.includes('statuts')) {
      console.log(`   📝 Utilisation: generateStatutsSARL`);
      content = generateStatutsSARL(company, associates, managers);
    } else if (docName.includes('Bail') || docName.includes('bail')) {
      console.log(`   📝 Utilisation: generateContratBail`);
      content = generateContratBail(company, additionalData);
    } else if (docName.includes('DSV') || docName.includes('Souscription')) {
      console.log(`   📝 Utilisation: generateDSV`);
      content = generateDSV(company, associates, additionalData);
    } else if (docName.includes('Gérant') || docName.includes('gérant') || docName.includes('dirigeant')) {
      console.log(`   📝 Utilisation: generateListeGerants`);
      content = generateListeGerants(company, managers);
    } else if (docName.includes('Déclaration') && (docName.includes('honneur') || docName.includes('Honneur'))) {
      console.log(`   📝 Utilisation: generateDeclarationHonneur`);
      content = generateDeclarationHonneur(company, managers);
    } else if (docName.includes('CEPICI') || docName.includes('cepici')) {
      console.log(`   📝 Utilisation: generateFormulaireCEPICI`);
      content = generateFormulaireCEPICI(company, managers, associates);
    } else if (generator) {
      console.log(`   📝 Utilisation: générateur depuis documentGenerators`);
      content = generator(company, associates, managers, additionalData);
    } else {
      throw new Error(`Template non trouvé pour le document: ${docName}`);
    }
    
    console.log(`   ✅ Contenu généré: ${content.length} caractères`);
  } catch (contentError) {
    console.error(`   ❌ Erreur génération contenu:`, contentError);
    throw contentError;
  }

  const baseFileName = safeFilePart(docName);
  const timestamp = Date.now();
  const result = {};


  // Générer PDF avec Puppeteer (méthode professionnelle)
  if (options.formats.includes('pdf')) {
    try {
      console.log(`   [PDF] Generation avec Puppeteer...`);
      const pdfFileName = `${baseFileName}_${timestamp}.pdf`;
      const pdfPath = path.join(GENERATED_DIR, pdfFileName);

      // Importer puppeteerGenerator dynamiquement si ce n'est pas deja fait
      if (!puppeteerGenerator) {
        try {
          console.log(`   [generateDocument] Import dynamique de puppeteerGenerator...`);
          puppeteerGenerator = await import('./puppeteerGenerator.js');
          console.log(`   [generateDocument] Import de puppeteerGenerator reussi`);
        } catch (importError) {
          console.error(`   [generateDocument] Erreur import puppeteerGenerator:`, importError.message);
          console.error(`   Stack:`, importError.stack);
          puppeteerGenerator = null;
        }
      }

      if (puppeteerGenerator && puppeteerGenerator.generateDocumentPDF) {
        await puppeteerGenerator.generateDocumentPDF(docName, company, associates, managers, additionalData, pdfPath);
      } else {
        throw new Error(`Generation PDF echouee: puppeteerGenerator indisponible.`);
      }

      if (!fs.existsSync(pdfPath)) {
        throw new Error(`Fichier PDF non cree: ${pdfPath}`);
      }

      const stats = fs.statSync(pdfPath);
      console.log(`   PDF cree: ${pdfFileName} (${stats.size} bytes)`);

      result.pdf = {
        fileName: pdfFileName,
        filePath: pdfPath,
        mimeType: 'application/pdf'
      };
    } catch (pdfError) {
      console.error(`   Erreur generation PDF:`, pdfError);
      throw pdfError;
    }
  }

  // Generer Word (sauf CEPICI qui utilise un PDF overlay officiel)
  const isCepici = docName.toLowerCase().includes('cepici');
  if (isCepici && options.formats.includes('docx')) {
    console.log(`   [DOCX] Skipped pour CEPICI (utilise PDF overlay officiel)`);
  }
  if (options.formats.includes('docx') && !isCepici) {
    try {
      console.log(`   [DOCX] Generation...`);
      const docxFileName = `${baseFileName}_${timestamp}.docx`;
      const docxPath = path.join(GENERATED_DIR, docxFileName);

      let htmlContent = null;

      if (!puppeteerGenerator) {
        try {
          console.log(`   [generateDocument] Import dynamique de puppeteerGenerator...`);
          puppeteerGenerator = await import('./puppeteerGenerator.js');
          console.log(`   [generateDocument] Import de puppeteerGenerator reussi`);
        } catch (importError) {
          console.error(`   [generateDocument] Erreur import puppeteerGenerator:`, importError.message);
          console.error(`   Stack:`, importError.stack);
          puppeteerGenerator = null;
        }
      }

      if (puppeteerGenerator && puppeteerGenerator.generateDocumentHTML) {
        try {
          htmlContent = puppeteerGenerator.generateDocumentHTML(docName, company, associates, managers, additionalData);
        } catch (htmlError) {
          console.warn(`   [DOCX] Generation HTML echouee, fallback contenu texte:`, htmlError.message);
        }
      }

      if (htmlContent) {
        const docxBlob = await htmlToDocx(htmlContent, null, {
          table: { row: { cantSplit: true } },
          footer: false,
          pageNumber: false,
        });
        // Convertir Blob en Buffer pour Node.js
        const arrayBuffer = await docxBlob.arrayBuffer();
        const docxBuffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(docxPath, docxBuffer);
      } else {
        await generateWordDocument(content, docName, docxPath);
      }

      if (!fs.existsSync(docxPath)) {
        throw new Error(`Fichier DOCX non cree: ${docxPath}`);
      }

      const stats = fs.statSync(docxPath);
      console.log(`   DOCX cree: ${docxFileName} (${stats.size} bytes)`);

      result.docx = {
        fileName: docxFileName,
        filePath: docxPath,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };
    } catch (docxError) {
      console.error(`   Erreur generation DOCX:`, docxError);
      throw docxError;
    }
  }

  console.log(`   [generateDocument] Termine: ${Object.keys(result).length} format(s) genere(s)`);
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

