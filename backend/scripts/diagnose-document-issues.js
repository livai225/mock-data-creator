import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_DIR = path.join(__dirname, '../../models_ecriture');

console.log('🔍 DIAGNOSTIC DES PROBLÈMES DE DOCUMENTS\n');
console.log('='.repeat(60));

// 1. Vérifier les modèles disponibles
console.log('\n📁 MODÈLES DISPONIBLES DANS models_ecriture:');

try {
    const types = fs.readdirSync(MODELS_DIR);
    
    for (const type of types) {
        const typePath = path.join(MODELS_DIR, type);
        if (fs.statSync(typePath).isDirectory()) {
            console.log(`\n📂 ${type}:`);
            const files = fs.readdirSync(typePath);
            
            for (const file of files) {
                if (file.endsWith('.docx')) {
                    const filePath = path.join(typePath, file);
                    const stats = fs.statSync(filePath);
                    console.log(`   📄 ${file} (${Math.round(stats.size / 1024)}KB)`);
                    
                    // Analyser le contenu pour trouver les placeholders
                    try {
                        const buffer = fs.readFileSync(filePath);
                        const result = await mammoth.extractRawText({ buffer });
                        const content = result.value;
                        
                        // Chercher les placeholders entre crochets
                        const placeholders = content.match(/\[([^\]]+)\]/g) || [];
                        const uniquePlaceholders = [...new Set(placeholders)];
                        
                        if (uniquePlaceholders.length > 0) {
                            console.log(`      🔸 Placeholders trouvés: ${uniquePlaceholders.slice(0, 5).join(', ')}${uniquePlaceholders.length > 5 ? '...' : ''}`);
                        }
                    } catch (error) {
                        console.log(`      ❌ Erreur lecture: ${error.message}`);
                    }
                }
            }
        }
    }
} catch (error) {
    console.error('❌ Erreur lecture models_ecriture:', error.message);
}

// 2. Vérifier comment les documents sont générés dans le code
console.log('\n\n🔧 ANALYSE DU CODE DE GÉNÉRATION:');

// Lire le fichier documentTemplates.js
const templatesPath = path.join(__dirname, '../src/utils/documentTemplates.js');
if (fs.existsSync(templatesPath)) {
    const content = fs.readFileSync(templatesPath, 'utf8');
    
    // Chercher les fonctions de génération
    const generators = content.match(/export const generate\w+/g) || [];
    console.log(`\n📝 Fonctions de génération trouvées: ${generators.length}`);
    generators.forEach(gen => console.log(`   - ${gen}`));
    
    // Vérifier si les modèles DOCX sont utilisés
    const usesDocxModels = content.includes('models_ecriture') || content.includes('mammoth');
    console.log(`\n📋 Utilisation des modèles DOCX: ${usesDocxModels ? '✅ OUI' : '❌ NON'}`);
    
    if (!usesDocxModels) {
        console.log('\n⚠️  PROBLÈME IDENTIFIÉ:');
        console.log('   Le système utilise des templates codés en dur au lieu des fichiers DOCX');
        console.log('   Cela explique les différences entre PDF et DOCX générés');
    }
} else {
    console.log('❌ Fichier documentTemplates.js non trouvé');
}

// 3. Vérifier les différences de format
console.log('\n\n📊 ANALYSE DES DIFFÉRENCES DE FORMAT:');
console.log('Le système génère actuellement:');
console.log('   📄 PDF: Via Puppeteer (HTML → PDF)');
console.log('   📝 DOCX: Via docx.js (texte brut → DOCX)');
console.log('\n⚠️  PROBLÈMES POTENTIELS:');
console.log('   1. Les PDF et DOCX utilisent des sources de données différentes');
console.log('   2. Les modèles DOCX dans models_ecriture ne sont pas utilisés');
console.log('   3. Le formatage peut être différent entre PDF et DOCX');

console.log('\n\n💡 SOLUTIONS RECOMMANDÉES:');
console.log('1. Utiliser les modèles DOCX de models_ecriture comme source unique');
console.log('2. Extraire le texte des modèles DOCX avec mammoth');
console.log('3. Utiliser ce texte pour générer PDF et DOCX de manière cohérente');
console.log('4. Remplacer les placeholders dans les modèles avec les données réelles');

console.log('\n' + '='.repeat(60));
console.log('🏁 FIN DU DIAGNOSTIC');
