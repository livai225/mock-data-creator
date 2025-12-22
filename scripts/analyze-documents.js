import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth'; // Pour lire les .docx
import pdfParse from 'pdf-parse'; // Pour lire les PDFs

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_DIR = path.join(__dirname, '../models_ecriture');

/**
 * Analyser un fichier DOCX
 */
async function analyzeDocx(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return {
      type: 'docx',
      content: result.value,
      messages: result.messages
    };
  } catch (error) {
    console.error(`Erreur lecture DOCX ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Analyser un fichier DOC (ancien format)
 */
async function analyzeDoc(filePath) {
  // Les fichiers .doc sont difficiles à lire sans bibliothèque spécialisée
  // On va juste noter qu'ils existent
  return {
    type: 'doc',
    content: '[Fichier .doc - nécessite conversion manuelle]',
    note: 'Les fichiers .doc nécessitent une conversion en .docx ou .txt pour être analysés'
  };
}

/**
 * Analyser un fichier PDF
 */
async function analyzePdf(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return {
      type: 'pdf',
      content: data.text,
      numPages: data.numpages,
      info: data.info
    };
  } catch (error) {
    console.error(`Erreur lecture PDF ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Analyser tous les fichiers dans un dossier
 */
async function analyzeDirectory(dirPath) {
  const results = {};
  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const file of files) {
    if (file.isFile()) {
      const filePath = path.join(dirPath, file.name);
      const ext = path.extname(file.name).toLowerCase();
      
      let analysis = null;
      if (ext === '.docx') {
        analysis = await analyzeDocx(filePath);
      } else if (ext === '.doc') {
        analysis = await analyzeDoc(filePath);
      } else if (ext === '.pdf') {
        analysis = await analyzePdf(filePath);
      }

      if (analysis) {
        results[file.name] = {
          path: filePath,
          ...analysis
        };
      }
    }
  }

  return results;
}

/**
 * Extraire la structure d'un document
 */
function extractStructure(content) {
  const lines = content.split('\n').filter(line => line.trim());
  
  const structure = {
    title: null,
    sections: [],
    articles: [],
    signatures: [],
    metadata: {}
  };

  let currentSection = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Détecter le titre (généralement en majuscules ou au début)
    if (!structure.title && line.length > 10 && line.length < 100) {
      if (line.match(/^[A-ZÉÈÊËÀÂÄÎÏÔÖÛÜÇ\s\-:]+$/) || i < 5) {
        structure.title = line;
      }
    }
    
    // Détecter les sections (TITRE, ARTICLE, etc.)
    if (line.match(/^(TITRE|TITLE|CHAPITRE|SECTION|ARTICLE|I-|II-|III-|IV-|V-)/i)) {
      structure.sections.push({
        type: 'section',
        title: line,
        lineNumber: i + 1
      });
      currentSection = line;
    }
    
    // Détecter les articles
    if (line.match(/^ARTICLE\s+\d+/i)) {
      structure.articles.push({
        type: 'article',
        title: line,
        lineNumber: i + 1
      });
    }
    
    // Détecter les signatures
    if (line.match(/(Fait|Signé|Signature|Le|À)/i) && 
        (line.includes('Abidjan') || line.includes('le') || line.includes('Fait'))) {
      structure.signatures.push({
        text: line,
        lineNumber: i + 1
      });
    }
  }

  return structure;
}

/**
 * Analyser tous les modèles
 */
async function analyzeAllModels() {
  const output = {
    timestamp: new Date().toISOString(),
    sarlUnipersonnelle: {},
    sarlPluripersonnelle: {}
  };

  const sarluPath = path.join(MODELS_DIR, 'SARL UNIPERSONNELLE');
  const sarlPluriPath = path.join(MODELS_DIR, 'SARL PLURIPERSONEL');

  if (fs.existsSync(sarluPath)) {
    console.log('Analyse SARL UNIPERSONNELLE...');
    const sarluFiles = await analyzeDirectory(sarluPath);
    
    for (const [fileName, fileData] of Object.entries(sarluFiles)) {
      if (fileData.content) {
        fileData.structure = extractStructure(fileData.content);
      }
    }
    
    output.sarlUnipersonnelle = sarluFiles;
  }

  if (fs.existsSync(sarlPluriPath)) {
    console.log('Analyse SARL PLURIPERSONNELLE...');
    const sarlPluriFiles = await analyzeDirectory(sarlPluriPath);
    
    for (const [fileName, fileData] of Object.entries(sarlPluriFiles)) {
      if (fileData.content) {
        fileData.structure = extractStructure(fileData.content);
      }
    }
    
    output.sarlPluripersonnelle = sarlPluriFiles;
  }

  // Sauvegarder les résultats
  const outputPath = path.join(__dirname, '../analysis-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  
  console.log(`\n✅ Analyse terminée. Résultats sauvegardés dans: ${outputPath}`);
  
  return output;
}

// Exécuter l'analyse
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeAllModels().catch(console.error);
}

export { analyzeAllModels, extractStructure };

