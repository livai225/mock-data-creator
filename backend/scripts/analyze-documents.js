import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_DIR = path.join(__dirname, '../../models_ecriture');
const OUTPUT_DIR = path.join(__dirname, '../../analysis-results');

// Créer le dossier de sortie
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

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
    console.error(`❌ Erreur lecture DOCX ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Analyser un fichier PDF
 * Note: Les PDFs nécessitent un environnement DOM, on les note pour analyse manuelle
 */
async function analyzePdf(filePath) {
  try {
    // Pour l'instant, on note juste que le fichier existe
    // Les PDFs seront analysés manuellement ou avec un outil externe
    return {
      type: 'pdf',
      content: '[Fichier PDF - nécessite extraction manuelle du texte]',
      note: 'Les fichiers PDF nécessitent une extraction manuelle ou un outil spécialisé. Le contenu peut être copié manuellement depuis le PDF.',
      filePath: filePath
    };
  } catch (error) {
    console.error(`❌ Erreur lecture PDF ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Extraire la structure et les textes juridiques d'un document
 */
function extractLegalTexts(content) {
  const lines = content.split('\n').filter(line => line.trim());
  
  const structure = {
    title: null,
    preamble: [],
    sections: [],
    articles: [],
    clauses: [],
    signatures: [],
    legalTexts: []
  };

  let currentSection = null;
  let inArticle = false;
  let currentArticle = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Détecter le titre
    if (!structure.title && line.length > 10 && line.length < 150) {
      if (line.match(/^(STATUT|CONTRAT|DÉCLARATION|FORMULAIRE|LISTE)/i) || i < 3) {
        structure.title = line;
        continue;
      }
    }
    
    // Détecter le préambule (avant les sections)
    if (!currentSection && !line.match(/^(TITRE|ARTICLE|I-|II-|III-)/i)) {
      if (i < 20) {
        structure.preamble.push(line);
      }
    }
    
    // Détecter les sections principales
    if (line.match(/^(TITRE|TITLE|CHAPITRE|SECTION|I-|II-|III-|IV-|V-)/i)) {
      currentSection = {
        type: 'section',
        title: line,
        lineNumber: i + 1,
        content: []
      };
      structure.sections.push(currentSection);
      inArticle = false;
      continue;
    }
    
    // Détecter les articles
    if (line.match(/^ARTICLE\s+\d+/i)) {
      currentArticle = {
        type: 'article',
        title: line,
        lineNumber: i + 1,
        content: []
      };
      structure.articles.push(currentArticle);
      inArticle = true;
      continue;
    }
    
    // Ajouter le contenu aux sections/articles
    if (currentSection && !inArticle) {
      currentSection.content.push(line);
    } else if (currentArticle) {
      currentArticle.content.push(line);
    }
    
    // Détecter les clauses juridiques importantes
    if (line.match(/(conformément|conformément à|selon|aux termes de|en vertu de|conformément aux|loi|décret|ordonnance|code|acte uniforme)/i)) {
      structure.legalTexts.push({
        text: line,
        lineNumber: i + 1,
        type: 'legal_reference'
      });
    }
    
    // Détecter les clauses importantes
    if (line.match(/(obligation|droit|devoir|responsabilité|garantie|engagement|déclare|reconnaît|accepte)/i)) {
      structure.clauses.push({
        text: line,
        lineNumber: i + 1
      });
    }
    
    // Détecter les signatures
    if (line.match(/(Fait à|Fait en|Signé|Signature|Le|À|Abidjan|le \d+)/i) && 
        (line.includes('Abidjan') || line.includes('le') || line.match(/\d{4}/))) {
      structure.signatures.push({
        text: line,
        lineNumber: i + 1
      });
    }
  }

  return structure;
}

/**
 * Analyser tous les fichiers dans un dossier
 */
async function analyzeDirectory(dirPath, category) {
  const results = {};
  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  console.log(`\n📁 Analyse de ${category}...`);

  for (const file of files) {
    if (file.isFile()) {
      const filePath = path.join(dirPath, file.name);
      const ext = path.extname(file.name).toLowerCase();
      
      console.log(`  📄 ${file.name}...`);
      
      let analysis = null;
      if (ext === '.docx') {
        analysis = await analyzeDocx(filePath);
      } else if (ext === '.pdf') {
        analysis = await analyzePdf(filePath);
      } else if (ext === '.doc') {
        // Les fichiers .doc nécessitent une conversion
        console.log(`    ⚠️  Fichier .doc détecté - nécessite conversion manuelle`);
        analysis = {
          type: 'doc',
          content: '[Fichier .doc - nécessite conversion en .docx ou .txt]',
          note: 'Les fichiers .doc nécessitent une conversion pour être analysés automatiquement'
        };
      }

      if (analysis && analysis.content) {
        analysis.structure = extractLegalTexts(analysis.content);
        analysis.fileName = file.name;
        analysis.filePath = filePath;
        
        // Sauvegarder le contenu brut
        const contentFile = path.join(OUTPUT_DIR, `${category}_${file.name.replace(/[^a-z0-9]/gi, '_')}.txt`);
        fs.writeFileSync(contentFile, analysis.content, 'utf-8');
        
        results[file.name] = analysis;
        console.log(`    ✅ Analysé (${analysis.content.length} caractères)`);
      }
    }
  }

  return results;
}

/**
 * Analyser tous les modèles
 */
async function analyzeAllModels() {
  console.log('🔍 Début de l\'analyse des modèles de documents...\n');

  const output = {
    timestamp: new Date().toISOString(),
    summary: {
      sarlUnipersonnelle: { count: 0, files: [] },
      sarlPluripersonnelle: { count: 0, files: [] }
    },
    sarlUnipersonnelle: {},
    sarlPluripersonnelle: {},
    legalTexts: {
      common: [],
      byDocument: {}
    }
  };

  const sarluPath = path.join(MODELS_DIR, 'SARL UNIPERSONNELLE');
  const sarlPluriPath = path.join(MODELS_DIR, 'SARL PLURIPERSONEL');

  if (fs.existsSync(sarluPath)) {
    console.log(`✅ Dossier trouvé: ${sarluPath}`);
    const sarluFiles = await analyzeDirectory(sarluPath, 'SARL_UNIPERSONNELLE');
    output.sarlUnipersonnelle = sarluFiles;
    output.summary.sarlUnipersonnelle.count = Object.keys(sarluFiles).length;
    output.summary.sarlUnipersonnelle.files = Object.keys(sarluFiles);
  } else {
    console.log(`❌ Dossier non trouvé: ${sarluPath}`);
  }

  if (fs.existsSync(sarlPluriPath)) {
    console.log(`✅ Dossier trouvé: ${sarlPluriPath}`);
    const sarlPluriFiles = await analyzeDirectory(sarlPluriPath, 'SARL_PLURIPERSONNELLE');
    output.sarlPluripersonnelle = sarlPluriFiles;
    output.summary.sarlPluripersonnelle.count = Object.keys(sarlPluriFiles).length;
    output.summary.sarlPluripersonnelle.files = Object.keys(sarlPluriFiles);
  } else {
    console.log(`❌ Dossier non trouvé: ${sarlPluriPath}`);
  }

  // Extraire les textes juridiques communs
  const allLegalTexts = [];
  [...Object.values(output.sarlUnipersonnelle), ...Object.values(output.sarlPluripersonnelle)].forEach(doc => {
    if (doc.structure && doc.structure.legalTexts) {
      allLegalTexts.push(...doc.structure.legalTexts);
    }
  });

  output.legalTexts.common = allLegalTexts;

  // Sauvegarder les résultats
  const outputPath = path.join(OUTPUT_DIR, 'analysis-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  
  console.log(`\n✅ Analyse terminée !`);
  console.log(`📊 Résultats:`);
  console.log(`   - SARL Unipersonnelle: ${output.summary.sarlUnipersonnelle.count} fichiers`);
  console.log(`   - SARL Pluripersonnelle: ${output.summary.sarlPluripersonnelle.count} fichiers`);
  console.log(`   - Textes juridiques trouvés: ${allLegalTexts.length}`);
  console.log(`\n💾 Résultats sauvegardés dans: ${outputPath}`);
  console.log(`📁 Contenus bruts dans: ${OUTPUT_DIR}`);
  
  return output;
}

// Exécuter l'analyse si le script est lancé directement
const isMainModule = import.meta.url === `file://${path.resolve(process.argv[1])}` || 
                     import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || process.argv[1]?.includes('analyze-documents')) {
  analyzeAllModels().catch(console.error);
}

export { analyzeAllModels, extractLegalTexts };

