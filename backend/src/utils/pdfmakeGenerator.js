import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import dynamique de pdfmake pour éviter les problèmes d'import ES modules
let PdfPrinter;
let printer;

// Initialiser pdfmake de manière asynchrone
const initPdfMake = async () => {
  console.log('   🔍 [initPdfMake] Début initialisation pdfmake...');
  if (!PdfPrinter) {
    try {
      console.log('   🔍 [initPdfMake] Import dynamique de pdfmake...');
      const pdfmakeModule = await import('pdfmake');
      console.log('   🔍 [initPdfMake] Module importé:', Object.keys(pdfmakeModule));
      
      PdfPrinter = pdfmakeModule.default || pdfmakeModule.PdfPrinter || pdfmakeModule;
      console.log('   🔍 [initPdfMake] PdfPrinter:', PdfPrinter ? 'Trouvé' : 'Non trouvé');
      
      if (!PdfPrinter) {
        throw new Error('PdfPrinter non trouvé dans le module pdfmake');
      }
      
      // Configuration des polices pour pdfmake
      // Utiliser les polices système standard pour éviter les problèmes de dépendances
      const fonts = {
        Roboto: {
          normal: 'Helvetica',
          bold: 'Helvetica-Bold',
          italics: 'Helvetica-Oblique',
          bolditalics: 'Helvetica-BoldOblique'
        }
      };
      
      console.log('   🔍 [initPdfMake] Création de l\'instance printer...');
      printer = new PdfPrinter(fonts);
      console.log('   ✅ [initPdfMake] Printer créé avec succès');
      return true;
    } catch (error) {
      console.error('❌ [initPdfMake] Erreur initialisation pdfmake:', error);
      console.error('   Stack:', error.stack);
      throw error;
    }
  } else {
    console.log('   ✅ [initPdfMake] PdfPrinter déjà initialisé');
  }
  return true;
};

/**
 * Convertir le contenu texte en structure pdfmake
 */
const parseContentToPdfMake = (content, templateName) => {
  const lines = content.split('\n');
  const docDefinition = {
    content: [],
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      lineHeight: 1.3,
      color: '#1E1E1E'
    },
    styles: {
      header: {
        fontSize: 14,
        bold: true,
        color: '#1E293B',
        margin: [0, 0, 0, 10]
      },
      title: {
        fontSize: 18,
        bold: true,
        alignment: 'center',
        margin: [0, 10, 0, 15]
      },
      subtitle: {
        fontSize: 14,
        bold: true,
        alignment: 'center',
        margin: [0, 5, 0, 10]
      },
      section: {
        fontSize: 12,
        bold: true,
        margin: [0, 15, 0, 8],
        color: '#1E293B'
      },
      article: {
        fontSize: 11,
        bold: true,
        color: '#D4AF37',
        margin: [0, 8, 0, 5]
      },
      label: {
        fontSize: 10,
        bold: true,
        margin: [0, 3, 0, 2]
      },
      value: {
        fontSize: 10,
        margin: [0, 0, 0, 5]
      },
      highlight: {
        fontSize: 10,
        bold: true,
        background: '#FFEB3B',
        margin: [0, 2, 0, 2]
      },
      paragraph: {
        fontSize: 10,
        margin: [0, 3, 0, 5],
        alignment: 'justify'
      }
    },
    pageMargins: [50, 70, 50, 60],
    pageSize: 'A4',
    info: {
      title: templateName,
      author: 'ARCH EXCELLENCE',
      subject: 'Document juridique'
    }
  };

  const isCEPICI = templateName.toLowerCase().includes('cepici');
  const isStatuts = templateName.toLowerCase().includes('statuts');

  // Header du document
  const headerTitle = templateName.includes('Statuts') ? 'Statuts de la société' :
                     templateName.includes('Bail') ? 'Contrat de bail' :
                     templateName.includes('CEPICI') ? 'Formulaire CEPICI' :
                     templateName.includes('Gérant') || templateName.includes('Dirigeant') ? 'Liste des dirigeants' :
                     templateName.includes('Déclaration') ? 'Déclaration sur l\'honneur' :
                     templateName.includes('DSV') ? 'Déclaration Souscription/Versement' :
                     templateName;

  docDefinition.content.push({
    text: headerTitle,
    style: 'header',
    margin: [0, 0, 0, 5]
  });

  docDefinition.content.push({
    text: 'Document 1 sur 1',
    fontSize: 9,
    color: '#666666',
    margin: [0, 0, 0, 15]
  });

  // Parser les lignes du contenu
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (!line) {
      // Ligne vide - espacement
      docDefinition.content.push({ text: '', margin: [0, 3, 0, 3] });
      i++;
      continue;
    }

    // Détection spéciale pour CEPICI
    if (isCEPICI) {
      if (line.match(/^RÉPUBLIQUE DE CÔTE D'IVOIRE/i)) {
        docDefinition.content.push({
          text: line,
          fontSize: 10,
          bold: true,
          alignment: 'center',
          margin: [0, 5, 0, 3]
        });
        i++;
        continue;
      }
      
      if (line.match(/^CEPICI$/i)) {
        docDefinition.content.push({
          text: line,
          fontSize: 14,
          bold: true,
          alignment: 'center',
          margin: [0, 8, 0, 3]
        });
        i++;
        continue;
      }
      
      if (line.match(/^GUICHET UNIQUE/i)) {
        docDefinition.content.push({
          text: line,
          fontSize: 10,
          bold: true,
          alignment: 'center',
          margin: [0, 5, 0, 3]
        });
        i++;
        continue;
      }
      
      if (line.match(/^FORMULAIRE UNIQUE/i)) {
        docDefinition.content.push({
          text: line,
          fontSize: 12,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 8]
        });
        i++;
        continue;
      }
      
      if (line.match(/^SECTION [A-Z]:/i)) {
        docDefinition.content.push({
          text: line,
          style: 'section',
          margin: [0, 12, 0, 6]
        });
        i++;
        continue;
      }
    }

    // Détection spéciale pour Statuts
    if (isStatuts) {
      if (line.match(/^STATUTS$/i)) {
        docDefinition.content.push({
          text: line,
          fontSize: 24,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 10]
        });
        i++;
        continue;
      }
      
      if (line.match(/^SOCIÉTÉ À RESPONSABILITÉ LIMITÉE/i)) {
        docDefinition.content.push({
          text: line,
          fontSize: 14,
          bold: true,
          alignment: 'center',
          margin: [0, 5, 0, 15]
        });
        i++;
        continue;
      }
      
      if (line.match(/^Sigle/i)) {
        docDefinition.content.push({
          text: line,
          fontSize: 10,
          alignment: 'center',
          margin: [0, 5, 0, 8]
        });
        // Ajouter une ligne de séparation après le sigle
        docDefinition.content.push({
          canvas: [{
            type: 'line',
            x1: 50,
            y1: 0,
            x2: 545,
            y2: 0,
            lineWidth: 0.5,
            lineColor: '#1E1E1E'
          }],
          margin: [0, 5, 0, 15]
        });
        i++;
        continue;
      }
    }

    // Articles
    if (line.toLowerCase().startsWith('article')) {
      docDefinition.content.push({
        text: line,
        style: 'article'
      });
      i++;
      continue;
    }

    // Labels avec valeurs (format "Label : valeur")
    if (line.includes(':') && line.indexOf(':') < 50) {
      const colonIndex = line.indexOf(':');
      const label = line.substring(0, colonIndex + 1);
      const value = line.substring(colonIndex + 1).trim();
      
      docDefinition.content.push({
        columns: [
          {
            text: label,
            style: 'label',
            width: 'auto'
          },
          {
            text: value || '',
            style: 'value',
            width: '*'
          }
        ],
        margin: [0, 2, 0, 4]
      });
      i++;
      continue;
    }

    // Titres (tout en majuscules, longueur > 3)
    if (line.match(/^[A-ZÉÈÊËÀÂÄÎÏÔÖÛÜÇ\s\-:]+$/) && line.length > 3 && !line.includes(':')) {
      docDefinition.content.push({
        text: line,
        style: 'section',
        margin: [0, 10, 0, 6]
      });
      i++;
      continue;
    }

    // Paragraphe normal - TOUJOURS inclure toutes les lignes
    docDefinition.content.push({
      text: line,
      style: 'paragraph'
    });
    i++;
  }

  console.log(`   📝 pdfmake: ${docDefinition.content.length} éléments de contenu générés`);
  
  return docDefinition;
};

/**
 * Générer un PDF avec pdfmake
 */
export const generatePdfWithPdfMake = async (content, templateName, outputPath) => {
  console.log(`   🔍 [generatePdfWithPdfMake] Début génération PDF avec pdfmake`);
  console.log(`   🔍 [generatePdfWithPdfMake] Template: ${templateName}`);
  console.log(`   🔍 [generatePdfWithPdfMake] Output: ${outputPath}`);
  
  return new Promise(async (resolve, reject) => {
    try {
      // Initialiser pdfmake si ce n'est pas déjà fait
      console.log('   🔍 [generatePdfWithPdfMake] Appel initPdfMake...');
      await initPdfMake();
      
      if (!printer) {
        throw new Error('pdfmake printer non initialisé après initPdfMake');
      }
      
      console.log('   🔍 [generatePdfWithPdfMake] Parsing du contenu...');
      const docDefinition = parseContentToPdfMake(content, templateName);
      console.log(`   🔍 [generatePdfWithPdfMake] DocDefinition créé avec ${docDefinition.content.length} éléments`);
      
      console.log('   🔍 [generatePdfWithPdfMake] Création du document PDFKit...');
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      console.log('   🔍 [generatePdfWithPdfMake] Document PDFKit créé');
      
      const stream = fs.createWriteStream(outputPath);
      console.log('   🔍 [generatePdfWithPdfMake] Stream créé');
      
      pdfDoc.pipe(stream);
      pdfDoc.end();
      console.log('   🔍 [generatePdfWithPdfMake] Document terminé, attente du stream...');
      
      stream.on('finish', () => {
        console.log('   ✅ [generatePdfWithPdfMake] Stream terminé avec succès');
        resolve();
      });
      
      stream.on('error', (error) => {
        console.error('❌ [generatePdfWithPdfMake] Erreur stream:', error);
        console.error('   Stack:', error.stack);
        reject(error);
      });
      
      pdfDoc.on('error', (error) => {
        console.error('❌ [generatePdfWithPdfMake] Erreur PDFKit document:', error);
        console.error('   Stack:', error.stack);
        reject(error);
      });
    } catch (error) {
      console.error('❌ [generatePdfWithPdfMake] Erreur génération:', error);
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
      reject(error);
    }
  });
};

