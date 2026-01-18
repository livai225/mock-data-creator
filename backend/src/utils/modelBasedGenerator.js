import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';
import { generateDocument } from './documentGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_DIR = path.join(__dirname, '../../models_ecriture');

/**
 * Mapper les types de documents vers les fichiers de modèles
 */
const DOCUMENT_MODELS = {
  // SARL PLURIPERSONNEL
  'statuts_sarl_pluripersonnel': 'SARL PLURIPERSONEL/STATUT Friends forage Cote D’ivoire.docx',
  'contrat_bail_pluripersonnel': 'SARL PLURIPERSONEL/contrat de bail HYDRA FORAGE.docx',
  'formulaire_unique_pluripersonnel': 'SARL PLURIPERSONEL/formulaire-unique HYDRA FOR.docx',
  'liste_gerants_pluripersonnel': 'SARL PLURIPERSONEL/Liste de gerant hydra forage.docx',
  'declaration_honneur_pluripersonnel': 'SARL PLURIPERSONEL/greffe-declaration-sur-l’honneur hydra forage.docx',
  
  // SARL UNIPERSONNELLE
  'statuts_sarl_unipersonnelle': 'SARL UNIPERSONNELLE/Staut de l\'entreprise.docx',
  'contrat_bail_unipersonnelle': 'SARL UNIPERSONNELLE/contrat de bai.docx',
  'dsv_unipersonnelle': 'SARL UNIPERSONNELLE/DSV.docx',
  'formulaire_unique_unipersonnelle': 'SARL UNIPERSONNELLE/formulaire-unique.docx',
  'liste_gerants_unipersonnelle': 'SARL UNIPERSONNELLE/Liste de gerant.docx',
  'declaration_honneur_unipersonnelle': 'SARL UNIPERSONNELLE/greffe-declaration-sur-l’honneur.docx'
};

/**
 * Déterminer le type de SARL en fonction du nombre d'associés
 */
const getSarlType = (associates) => {
  return (!associates || associates.length <= 1) ? 'unipersonnelle' : 'pluripersonnel';
};

/**
 * Obtenir le chemin du modèle pour un document donné
 */
const getModelPath = (docName, company, associates) => {
  const sarlType = getSarlType(associates);
  
  // Normaliser le nom du document
  const normalizedDocName = docName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, '_');
  
  // Chercher une correspondance exacte
  const exactKey = `${normalizedDocName}_${sarlType}`;
  if (DOCUMENT_MODELS[exactKey]) {
    return path.join(MODELS_DIR, DOCUMENT_MODELS[exactKey]);
  }
  
  // Chercher une correspondance partielle
  const partialKey = Object.keys(DOCUMENT_MODELS).find(key => 
    key.includes(normalizedDocName) && key.includes(sarlType)
  );
  
  if (partialKey) {
    return path.join(MODELS_DIR, DOCUMENT_MODELS[partialKey]);
  }
  
  console.warn(`⚠️ Modèle non trouvé pour: ${docName} (${sarlType})`);
  return null;
};

/**
 * Extraire le texte d'un fichier modèle DOCX
 */
const extractModelText = async (modelPath) => {
  try {
    const buffer = fs.readFileSync(modelPath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error(`❌ Erreur lecture modèle ${modelPath}:`, error.message);
    throw new Error(`Impossible de lire le modèle: ${error.message}`);
  }
};

/**
 * Remplacer les placeholders dans le texte du modèle
 */
const replacePlaceholders = (template, company, associates, managers, additionalData = {}) => {
  let result = template;
  
  // Données de l'entreprise
  result = result.replace(/\[NOM_ENTREPRISE\]/g, company.company_name || '[NOM_ENTREPRISE]');
  result = result.replace(/\[FORME_JURIDIQUE\]/g, company.company_type || '[FORME_JURIDIQUE]');
  result = result.replace(/\[CAPITAL\]/g, company.capital || '0');
  result = result.replace(/\[CAPITAL_LETTRES\]/g, numberToWords(company.capital || 0));
  result = result.replace(/\[ADRESSE\]/g, company.address || '[ADRESSE]');
  result = result.replace(/\[VILLE\]/g, company.city || '[VILLE]');
  result = result.replace(/\[PAYS\]/g, company.country || 'Côte d\'Ivoire');
  result = result.replace(/\[TELEPHONE\]/g, company.telephone || '[TELEPHONE]');
  result = result.replace(/\[EMAIL\]/g, company.email || '[EMAIL]');
  result = result.replace(/\[DUREE_SOCIETE\]/g, company.duree_societe || '99');
  result = result.replace(/\[OBJET_SOCIAL\]/g, company.objet_social || '[OBJET_SOCIAL]');
  
  // Données additionnelles
  result = result.replace(/\[COMMUNE\]/g, additionalData.commune || company.commune || '[COMMUNE]');
  result = result.replace(/\[QUARTIER\]/g, additionalData.quartier || company.quartier || '[QUARTIER]');
  result = result.replace(/\[LOT\]/g, additionalData.lot || company.lot || '[LOT]');
  result = result.replace(/\[ILOT\]/g, additionalData.ilot || company.ilot || '[ILOT]');
  
  // Gérant
  if (managers && managers.length > 0) {
    const gerant = managers[0];
    result = result.replace(/\[NOM_GERANT\]/g, `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim());
    result = result.replace(/\[PRENOMS_GERANT\]/g, gerant.prenoms || '[PRENOMS]');
    result = result.replace(/\[NOM_FAMILLE_GERANT\]/g, gerant.nom || '[NOM]');
    result = result.replace(/\[PROFESSION_GERANT\]/g, gerant.profession || '[PROFESSION]');
    result = result.replace(/\[ADRESSE_GERANT\]/g, gerant.adresse || '[ADRESSE]');
    result = result.replace(/\[VILLE_RESIDENCE_GERANT\]/g, gerant.ville_residence || '[VILLE]');
    result = result.replace(/\[NATIONALITE_GERANT\]/g, gerant.nationalite || '[NATIONALITE]');
    result = result.replace(/\[DATE_NAISSANCE_GERANT\]/g, gerant.date_naissance ? formatDate(gerant.date_naissance) : '[DATE_NAISSANCE]');
    result = result.replace(/\[LIEU_NAISSANCE_GERANT\]/g, gerant.lieu_naissance || '[LIEU_NAISSANCE]');
    result = result.replace(/\[TYPE_IDENTITE_GERANT\]/g, gerant.type_identite || 'CNI');
    result = result.replace(/\[NUMERO_IDENTITE_GERANT\]/g, gerant.numero_identite || '[NUMERO_IDENTITE]');
    result = result.replace(/\[DATE_DELIVRANCE_ID_GERANT\]/g, gerant.date_delivrance_id ? formatDate(gerant.date_delivrance_id) : '[DATE_DELIVRANCE]');
    result = result.replace(/\[DATE_VALIDITE_ID_GERANT\]/g, gerant.date_validite_id ? formatDate(gerant.date_validite_id) : '[DATE_VALIDITE]');
    result = result.replace(/\[LIEU_DELIVRANCE_ID_GERANT\]/g, gerant.lieu_delivrance_id || 'Côte d\'Ivoire');
  }
  
  // Bailleur (si disponible)
  if (additionalData.bailleur_nom) {
    result = result.replace(/\[NOM_BAILLEUR\]/g, additionalData.bailleur_nom);
    result = result.replace(/\[TELEPHONE_BAILLEUR\]/g, additionalData.bailleur_telephone || '[TELEPHONE]');
    result = result.replace(/\[ADRESSE_BAILLEUR\]/g, additionalData.bailleur_adresse || '[ADRESSE]');
    result = result.replace(/\[LOYER_MENSUEL\]/g, additionalData.loyer_mensuel || '0');
    result = result.replace(/\[CAUTION_MOIS\]/g, additionalData.caution_mois || '2');
    result = result.replace(/\[AVANCE_MOIS\]/g, additionalData.avance_mois || '2');
    result = result.replace(/\[DUREE_BAIL\]/g, additionalData.duree_bail || '1');
    result = result.replace(/\[DATE_DEBUT_BAIL\]/g, additionalData.date_debut || '[DATE_DEBUT]');
    result = result.replace(/\[DATE_FIN_BAIL\]/g, additionalData.date_fin || '[DATE_FIN]');
  }
  
  // Remplacer les placeholders restants par des valeurs par défaut
  result = result.replace(/\[[^\]]+\]/g, (match) => {
    console.warn(`⚠️ Placeholder non remplacé: ${match}`);
    return match;
  });
  
  return result;
};

/**
 * Convertir un nombre en lettres (français)
 */
const numberToWords = (num) => {
  const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  
  if (num === 0) return 'zéro';
  if (num < 20) return ones[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    if (ten === 7 || ten === 9) {
      return tens[ten] + (one > 0 ? '-' + ones[10 + one] : '');
    }
    return tens[ten] + (one > 0 ? '-' + ones[one] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return (hundred === 1 ? 'cent' : ones[hundred] + ' cent') + 
           (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    return (thousand === 1 ? 'mille' : numberToWords(thousand) + ' mille') + 
           (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  return num.toString();
};

/**
 * Formater une date au format français
 */
const formatDate = (dateString) => {
  if (!dateString) return '[DATE]';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

/**
 * Générer un document en utilisant les modèles DOCX
 */
export const generateDocumentFromModel = async (docName, company, associates = [], managers = [], additionalData = {}, options = { formats: ['pdf', 'docx'] }) => {
  console.log(`\n🔧 [ModelBasedGenerator] Génération de: "${docName}"`);
  
  // Déterminer le type de SARL
  const sarlType = getSarlType(associates);
  console.log(`   Type SARL: ${sarlType}`);
  
  // Obtenir le chemin du modèle
  const modelPath = getModelPath(docName, company, associates);
  if (!modelPath) {
    console.log(`   ❌ Modèle non trouvé, utilisation du générateur par défaut`);
    // Retourner au système par défaut
    return await generateDocument(docName, company, associates, managers, additionalData, options);
  }
  
  console.log(`   📄 Modèle utilisé: ${path.relative(process.cwd(), modelPath)}`);
  
  try {
    // Extraire le texte du modèle
    const templateText = await extractModelText(modelPath);
    console.log(`   ✅ Template extrait: ${templateText.length} caractères`);
    
    // Remplacer les placeholders
    const processedText = replacePlaceholders(templateText, company, associates, managers, additionalData);
    console.log(`   ✅ Texte traité: ${processedText.length} caractères`);
    
    // Utiliser le système de génération existant avec le texte traité
    const result = await generateDocument(docName, company, associates, managers, additionalData, {
      ...options,
      customContent: processedText
    });
    
    console.log(`   ✅ Document généré avec succès`);
    return result;
    
  } catch (error) {
    console.error(`   ❌ Erreur génération modèle:`, error.message);
    // Retourner au système par défaut en cas d'erreur
    console.log(`   🔄 Utilisation du générateur par défaut`);
    return await generateDocument(docName, company, associates, managers, additionalData, options);
  }
};

/**
 * Générer plusieurs documents en utilisant les modèles
 */
export const generateMultipleDocumentsFromModels = async (docNames, company, associates = [], managers = [], additionalData = {}, options = { formats: ['pdf', 'docx'] }) => {
  const results = [];
  
  for (const docName of docNames) {
    try {
      const result = await generateDocumentFromModel(docName, company, associates, managers, additionalData, options);
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
