/**
 * Générateur de documents DOCX avec docxtemplater
 * Produit des documents fidèles au modèle original en remplaçant
 * les placeholders dans le template .docx
 */

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import {
  Document as DocxDocument,
  Packer as DocxPacker,
  Paragraph as DocxParagraph,
  TextRun as DocxTextRun,
  Table as DocxTable,
  TableRow as DocxTableRow,
  TableCell as DocxTableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
  Footer as DocxFooter,
  PageNumber as DocxPageNumber,
  NumberFormat,
  SectionType,
  PageOrientation,
  convertInchesToTwip,
} from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, '../../templates');
const GENERATED_DIR = path.join(__dirname, '../../generated');

// ============================================================
// UTILITAIRES
// ============================================================

const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return Number(num).toLocaleString('fr-FR').replace(/\s/g, '.');
};

const formatDate = (dateString) => {
  if (!dateString) return '___/___/______';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return dateString;
  }
};

const numberToWords = (num) => {
  const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

  num = Number(num);
  if (isNaN(num) || num === 0) return 'zéro';
  if (num < 0) return 'moins ' + numberToWords(-num);
  if (num < 20) return ones[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    if (ten === 7) return 'soixante' + (one === 0 ? '-dix' : '-' + ones[10 + one]);
    if (ten === 8) return one === 0 ? 'quatre-vingts' : 'quatre-vingt-' + ones[one];
    if (ten === 9) return 'quatre-vingt' + (one === 0 ? '-dix' : '-' + ones[10 + one]);
    return tens[ten] + (one > 0 ? '-' + ones[one] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    const prefix = hundred === 1 ? 'cent' : ones[hundred] + ' cent';
    const suffix = remainder === 0 && hundred > 1 ? 's' : '';
    return prefix + suffix + (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    const prefix = thousand === 1 ? 'mille' : numberToWords(thousand) + ' mille';
    return prefix + (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  if (num < 1000000000) {
    const million = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    const prefix = million === 1 ? 'un million' : numberToWords(million) + ' millions';
    return prefix + (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  if (num < 1000000000000) {
    const milliard = Math.floor(num / 1000000000);
    const remainder = num % 1000000000;
    const prefix = milliard === 1 ? 'un milliard' : numberToWords(milliard) + ' milliards';
    return prefix + (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  return num.toString();
};

const yearToWords = (year) => {
  const words = numberToWords(Number(year));
  return words.replace(/\b\w/g, c => c.toUpperCase());
};

const safeFilePart = (value) => {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 50);
};

// ============================================================
// DONNÉES COMMUNES (réutilisées par plusieurs générateurs)
// ============================================================

const getCommonData = (company, associates = [], managers = []) => {
  const gerant = managers[0] || {};
  const associe = associates[0] || {};

  // Nom complet de l'ASSOCIÉ (depuis la table associates)
  const associeNomComplet = associe.name
    || (associe.nom && associe.prenoms ? `${associe.nom} ${associe.prenoms}`.trim() : null)
    || company.gerant
    || '[NOM COMPLET]';

  // Nom complet du GÉRANT (depuis la table managers, fallback = associé si gérant = associé)
  const gerantNomComplet = (gerant.nom && gerant.prenoms)
    ? `${gerant.nom} ${gerant.prenoms}`.trim()
    : associeNomComplet;

  const capital = Number(company.capital) || 0;
  const nombreParts = company.nombre_parts || associe.parts || Math.floor(capital / 5000) || 100;
  const valeurPart = capital > 0 && nombreParts > 0 ? Math.floor(capital / nombreParts) : 5000;

  const dateConstitution = company.date_constitution || company.created_at || new Date().toISOString();
  const year = new Date(dateConstitution).getFullYear();
  const rawDureeMandat = gerant.duree_mandat_annees || gerant.duree_mandat || 4;
  const dureeMandat = typeof rawDureeMandat === 'string'
    ? parseInt(rawDureeMandat.replace(/\s*ans\s*/i, '').trim()) || 4
    : Number(rawDureeMandat) || 4;
  const dureeSociete = company.duree_societe || 99;

  const denominationCourte = company.company_name || '[DENOMINATION]';
  const sigle = company.sigle;
  const nomCommercial = company.nom_commercial || null;
  let denominationComplete;
  if (sigle && nomCommercial) {
    denominationComplete = `${denominationCourte}, en abrégée ${sigle} et qui a pour nom commercial ${nomCommercial}`;
  } else if (sigle) {
    denominationComplete = `${denominationCourte}, en abrégée ${sigle}`;
  } else if (nomCommercial) {
    denominationComplete = `${denominationCourte} SARL et qui a pour nom commercial ${nomCommercial}`;
  } else {
    denominationComplete = `${denominationCourte} SARL`;
  }

  const siegeParts = [
    company.city,
    company.commune ? `COMMUNE DE ${company.commune.toUpperCase()}` : null,
    company.quartier,
    company.address,
    company.lot ? `LOT ${company.lot}` : null,
    company.ilot ? `ILOT ${company.ilot}` : null,
  ].filter(Boolean);
  const siegeSocialComplet = siegeParts.join(', ') || '[SIEGE SOCIAL]';

  return {
    // Dénomination
    denomination_complete: denominationComplete,
    denomination_courte: denominationCourte,
    siege_social_complet: siegeSocialComplet,

    // Dates
    date_constitution: formatDate(dateConstitution),
    annee_lettres: `Deux Mille ${yearToWords(year).split(' ').slice(-1)[0]}`,

    // ─── ASSOCIÉ (utilisé dans préambule, tableaux, signature des statuts et DSV) ───
    associe_nom_complet: associeNomComplet,
    associe_nom: associe.name?.split(' ')[0] || associe.nom || '[NOM]',
    associe_prenoms: associe.name?.split(' ').slice(1).join(' ') || associe.prenoms || '[PRENOMS]',
    associe_profession: associe.profession || '[PROFESSION]',
    associe_ville_residence: associe.ville_residence || associe.villeResidence || associe.adresse || company.city || 'ABIDJAN',
    associe_nationalite: associe.nationalite || 'Ivoirienne',
    associe_date_naissance: formatDate(associe.date_naissance || associe.dateNaissance),
    associe_lieu_naissance: associe.lieu_naissance || associe.lieuNaissance || '[LIEU DE NAISSANCE]',
    associe_domicile: associe.adresse || associe.ville_residence || company.city || '[DOMICILE]',
    associe_civilite: associe.civilite || 'M.',

    // Pièce d'identité de l'ASSOCIÉ (préambule statuts, DSV)
    // Fallback sur gérant pour backward compat (entreprises existantes où associé.date_validite_id était NULL)
    type_identite: associe.type_identite || associe.typeIdentite || gerant.type_identite || gerant.typeIdentite || 'CNI',
    numero_identite: associe.numero_identite || associe.numeroIdentite || gerant.numero_identite || gerant.numeroIdentite || '[N° IDENTITE]',
    date_delivrance_id: formatDate(associe.date_delivrance_id || associe.dateDelivranceId || gerant.date_delivrance_id || gerant.dateDelivranceId),
    date_validite_id: formatDate(associe.date_validite_id || associe.dateValiditeId || gerant.date_validite_id || gerant.dateValiditeId),
    lieu_delivrance_id: associe.lieu_delivrance_id || associe.lieuDelivranceId || gerant.lieu_delivrance_id || gerant.lieuDelivranceId || 'la République de Côte d\'Ivoire',

    // ─── GÉRANT (utilisé dans Art.13/25 des statuts, liste gérants, bail, décl. honneur) ───
    gerant_nom_complet: gerantNomComplet,
    gerant_nom: gerant.nom || associe.name?.split(' ')[0] || '[NOM]',
    gerant_prenoms: gerant.prenoms || associe.name?.split(' ').slice(1).join(' ') || '[PRENOMS]',
    gerant_profession: gerant.profession || associe.profession || '[PROFESSION]',
    gerant_ville_residence: gerant.ville_residence || company.city || 'ABIDJAN',
    gerant_nationalite: gerant.nationalite || associe.nationalite || 'Ivoirienne',
    gerant_date_naissance: formatDate(gerant.date_naissance || gerant.dateNaissance || associe.date_naissance || associe.dateNaissance),
    gerant_lieu_naissance: gerant.lieu_naissance || gerant.lieuNaissance || associe.lieu_naissance || associe.lieuNaissance || '[LIEU DE NAISSANCE]',
    gerant_domicile: gerant.adresse || gerant.ville_residence || company.city || '[DOMICILE]',
    gerant_civilite: gerant.civilite || associe.civilite || 'M.',

    // Pièce d'identité du GÉRANT (Art.13/25 statuts, liste gérants)
    gerant_type_identite: gerant.type_identite || gerant.typeIdentite || associe.type_identite || associe.typeIdentite || 'CNI',
    gerant_numero_identite: gerant.numero_identite || gerant.numeroIdentite || associe.numero_identite || associe.numeroIdentite || '[N° IDENTITE]',
    gerant_date_delivrance_id: formatDate(gerant.date_delivrance_id || gerant.dateDelivranceId || associe.date_delivrance_id || associe.dateDelivranceId),
    gerant_date_validite_id: formatDate(gerant.date_validite_id || gerant.dateValiditeId || associe.date_validite_id || associe.dateValiditeId),
    gerant_lieu_delivrance_id: gerant.lieu_delivrance_id || gerant.lieuDelivranceId || associe.lieu_delivrance_id || associe.lieuDelivranceId || 'la République de Côte d\'Ivoire',

    // Capital
    capital_formatte: formatNumber(capital),
    capital_lettres: numberToWords(capital).toUpperCase(),
    capital_lettres_min: numberToWords(capital),

    // Parts
    nombre_parts: String(nombreParts),
    valeur_part: String(valeurPart),
    valeur_part_formatte: formatNumber(valeurPart),

    // Banque
    banque: company.banque || '[NOM DE LA BANQUE]',

    // Durées
    duree_societe: String(dureeSociete),
    duree_societe_lettres: numberToWords(dureeSociete),
    duree_mandat: String(dureeMandat),
    duree_mandat_lettres: numberToWords(dureeMandat),

    // Objet social
    objet_social: company.activity || company.objet_social || '[OBJET SOCIAL]',

    // Parents du GÉRANT (pour déclaration sur l'honneur)
    pere_nom: gerant.pere_nom || '[NOM DU PERE]',
    mere_nom: gerant.mere_nom || '[NOM DE LA MERE]',

    // Ville
    ville: company.city || 'ABIDJAN',

    // Qualité
    qualite: 'GERANT',

    // Civilité : gérant (pour bail preneur, liste gérants — backward compat)
    civilite: gerant.civilite || associe.civilite || 'M.',
  };
};

// ============================================================
// MOTEUR DE GÉNÉRATION
// ============================================================

const generateDocxFromTemplate = (templatePath, data) => {
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{', end: '}' },
  });
  doc.render(data);
  return doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
};

const convertDocxToPdf = (docxPath, outputDir) => {
  try {
    execSync(
      `libreoffice --headless --convert-to pdf "${docxPath}" --outdir "${outputDir}"`,
      { timeout: 30000, stdio: 'pipe' }
    );
    const pdfName = path.basename(docxPath, '.docx') + '.pdf';
    const pdfPath = path.join(outputDir, pdfName);
    if (fs.existsSync(pdfPath)) return pdfPath;
    throw new Error(`PDF non créé: ${pdfPath}`);
  } catch (error) {
    console.error('❌ Erreur conversion PDF:', error.message);
    throw new Error(`Conversion PDF échouée: ${error.message}`);
  }
};

/**
 * Fonction générique pour générer un document DOCX + PDF
 */
const generateDocx = async (templateName, docTypeSlug, data, companyName, options) => {
  const templatePath = path.join(TEMPLATES_DIR, templateName);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template introuvable: ${templatePath}`);
  }

  fs.mkdirSync(GENERATED_DIR, { recursive: true });

  const timestamp = Date.now();
  const baseFileName = `${docTypeSlug}_${safeFilePart(companyName)}_${timestamp}`;
  const result = {};

  // Générer le DOCX
  if (options.formats.includes('docx')) {
    const docxBuffer = generateDocxFromTemplate(templatePath, data);
    const docxFileName = `${baseFileName}.docx`;
    const docxPath = path.join(GENERATED_DIR, docxFileName);
    fs.writeFileSync(docxPath, docxBuffer);
    console.log(`   ✅ DOCX généré: ${docxFileName} (${docxBuffer.length} bytes)`);
    result.docx = {
      fileName: docxFileName,
      filePath: docxPath,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
  }

  // Générer le PDF
  if (options.formats.includes('pdf')) {
    try {
      let docxPathForPdf = result.docx?.filePath;
      if (!docxPathForPdf) {
        const docxBuffer = generateDocxFromTemplate(templatePath, data);
        docxPathForPdf = path.join(GENERATED_DIR, `${baseFileName}_tmp.docx`);
        fs.writeFileSync(docxPathForPdf, docxBuffer);
      }
      const pdfPath = convertDocxToPdf(docxPathForPdf, GENERATED_DIR);
      const pdfFileName = path.basename(pdfPath);
      if (!result.docx && fs.existsSync(docxPathForPdf)) {
        fs.unlinkSync(docxPathForPdf);
      }
      console.log(`   ✅ PDF généré: ${pdfFileName}`);
      result.pdf = {
        fileName: pdfFileName,
        filePath: pdfPath,
        mimeType: 'application/pdf',
      };
    } catch (error) {
      console.error('   ❌ Erreur génération PDF:', error.message);
      console.warn('   ⚠️ Le DOCX a été généré, seul le PDF a échoué');
    }
  }

  return result;
};

// ============================================================
// 1. STATUTS SARLU
// ============================================================

export const generateStatutsSarluDocx = async (company, associates = [], managers = [], options = { formats: ['pdf', 'docx'] }) => {
  console.log('\n📄 [DocxGenerator] Génération Statuts SARLU...');
  const data = getCommonData(company, associates, managers);
  console.log('   Données préparées:', JSON.stringify(data, null, 2));
  return generateDocx('statuts_sarlu_template.docx', 'statuts_sarl', data, company.company_name, options);
};

// ============================================================
// 2. CONTRAT DE BAIL
// ============================================================

const prepareContratBailData = (company, associates = [], managers = [], additionalData = {}) => {
  const common = getCommonData(company, associates, managers);

  const loyerMensuel = Number(additionalData.loyer_mensuel) || 0;
  const cautionMois = Number(additionalData.caution_mois) || 2;
  const avanceMois = Number(additionalData.avance_mois) || 2;
  const garantieTotal = loyerMensuel * (cautionMois + avanceMois);

  const bailleurNom = additionalData.bailleur_nom || '[NOM DU BAILLEUR]';
  const bailleurTelephone = additionalData.bailleur_telephone || additionalData.bailleur_contact || '[TELEPHONE]';
  const bailleurAdresse = (additionalData.bailleur_adresse && String(additionalData.bailleur_adresse).trim())
    || (company.commune && String(company.commune).trim())
    || (company.city && String(company.city).trim())
    || '[ADRESSE DU BAILLEUR]';
  const dureeBail = Number(additionalData.duree_bail) || Number(additionalData.duree_bail_annees) || 1;

  return {
    ...common,
    bailleur_nom_complet: bailleurNom,
    bailleur_telephone: bailleurTelephone,
    bailleur_adresse: bailleurAdresse,
    date_debut_bail: formatDate(additionalData.date_debut),
    date_fin_bail: formatDate(additionalData.date_fin),
    date_signature: formatDate(additionalData.date_debut || new Date().toISOString()),
    duree_bail_lettres: numberToWords(dureeBail),
    duree_bail: String(dureeBail),
    loyer_formatte: formatNumber(loyerMensuel),
    loyer_lettres: numberToWords(loyerMensuel).charAt(0).toUpperCase() + numberToWords(loyerMensuel).slice(1),
    garantie_formatte: formatNumber(garantieTotal),
    garantie_lettres: numberToWords(garantieTotal).toUpperCase(),
    caution_mois: numberToWords(cautionMois),
    caution_mois_chiffre: String(cautionMois),
    avance_mois: numberToWords(avanceMois),
    avance_mois_chiffre: String(avanceMois),
  };
};

export const generateContratBailDocx = async (company, associates = [], managers = [], additionalData = {}, options = { formats: ['pdf', 'docx'] }) => {
  console.log('\n📄 [DocxGenerator] Génération Contrat de Bail...');
  const data = prepareContratBailData(company, associates, managers, additionalData);
  console.log('   Données préparées:', JSON.stringify(data, null, 2));
  return generateDocx('contrat_bail_sarlu_template.docx', 'contrat_bail', data, company.company_name, options);
};

// ============================================================
// 2b. CONTRAT DE BAIL - ENTREPRISE INDIVIDUELLE
// ============================================================

const prepareContratBailEIData = (company, managers = [], additionalData = {}) => {
  const common = getCommonData(company, [], managers);
  const proprietaire = managers[0] || {};

  const proprietaireNomComplet = proprietaire.nom && proprietaire.prenoms
    ? `${proprietaire.nom} ${proprietaire.prenoms}`.trim()
    : company.gerant || '[NOM DU PROPRIETAIRE]';

  const nomCommercial = company.nom_commercial || '';

  // Ligne identifiant le preneur EI
  const preneurEiDescription = nomCommercial
    ? `${proprietaireNomComplet} ayant pour nom commercial « ${nomCommercial} » Représenté par son exploitant(e) Monsieur ${proprietaireNomComplet}`
    : `${proprietaireNomComplet} Représenté par son exploitant(e) Monsieur ${proprietaireNomComplet}`;

  // Objet d'exploitation
  const objetExploitationEi = nomCommercial
    ? `${proprietaireNomComplet} ayant pour nom commercial « ${nomCommercial} »`
    : proprietaireNomComplet;

  const loyerMensuel = Number(additionalData.loyer_mensuel) || 0;
  const cautionMois = Number(additionalData.caution_mois) || 2;
  const avanceMois = Number(additionalData.avance_mois) || 2;
  const garantieTotal = loyerMensuel * (cautionMois + avanceMois);

  const bailleurNom = additionalData.bailleur_nom || '[NOM DU BAILLEUR]';
  const bailleurTelephone = additionalData.bailleur_telephone || additionalData.bailleur_contact || '[TELEPHONE]';
  const bailleurAdresse = (additionalData.bailleur_adresse && String(additionalData.bailleur_adresse).trim())
    || (company.commune && String(company.commune).trim())
    || (company.city && String(company.city).trim())
    || '[ADRESSE DU BAILLEUR]';
  const dureeBail = Number(additionalData.duree_bail) || Number(additionalData.duree_bail_annees) || 1;

  return {
    ...common,
    preneur_ei_description: preneurEiDescription,
    objet_exploitation_ei: objetExploitationEi,
    bailleur_nom_complet: bailleurNom,
    bailleur_telephone: bailleurTelephone,
    bailleur_adresse: bailleurAdresse,
    date_debut_bail: formatDate(additionalData.date_debut),
    date_fin_bail: formatDate(additionalData.date_fin),
    date_signature: formatDate(additionalData.date_debut || new Date().toISOString()),
    duree_bail_lettres: numberToWords(dureeBail),
    duree_bail: String(dureeBail),
    loyer_formatte: formatNumber(loyerMensuel),
    loyer_lettres: numberToWords(loyerMensuel).charAt(0).toUpperCase() + numberToWords(loyerMensuel).slice(1),
    garantie_formatte: formatNumber(garantieTotal),
    garantie_lettres: numberToWords(garantieTotal).toUpperCase(),
    caution_mois: numberToWords(cautionMois),
    caution_mois_chiffre: String(cautionMois),
    avance_mois: numberToWords(avanceMois),
    avance_mois_chiffre: String(avanceMois),
  };
};

export const generateContratBailEIDocx = async (company, managers = [], additionalData = {}, options = { formats: ['pdf', 'docx'] }) => {
  console.log('\n📄 [DocxGenerator] Génération Contrat de Bail EI...');
  const data = prepareContratBailEIData(company, managers, additionalData);
  console.log('   Données préparées:', JSON.stringify(data, null, 2));
  return generateDocx('contrat_bail_ei_template.docx', 'contrat_bail', data, company.company_name, options);
};

// ============================================================
// 3. DSV (Déclaration de Souscription et de Versement)
// ============================================================

const prepareDsvPluriData = (company, associates = [], managers = []) => {
  const common = getCommonData(company, associates, managers);
  const capital = Number(company.capital) || 0;
  const nombreParts = Number(common.nombre_parts) || 0;
  const valeurPart = Number(common.valeur_part) || 0;

  const associesIdentitesDsv = associates.map((a, i) => {
    const nom = a.nom ? `${a.nom} ${a.prenoms || ''}`.trim() : a.name || `[ASSOCIE ${i + 1}]`;
    const profession = a.profession || '[PROFESSION]';
    const residence = a.adresseDomicile || a.ville_residence || company.city || 'ABIDJAN';
    const nationalite = a.nationalite || 'Ivoirienne';
    const dateNaissance = formatDate(a.dateNaissance || a.date_naissance);
    const lieuNaissance = a.lieuNaissance || a.lieu_naissance || '[LIEU]';
    const typeId = a.typeIdentite || a.type_identite || 'CNI';
    const numId = a.numeroIdentite || a.numero_identite || '[N°]';
    const dateDeliv = formatDate(a.dateDelivranceId || a.date_delivrance_id);
    const dateValid = formatDate(a.dateValiditeId || a.date_validite_id);
    const lieuDeliv = a.lieuDelivranceId || a.lieu_delivrance_id || 'République de Côte d\'Ivoire';

    return `${a.civilite || 'M.'} ${nom}, ${profession}, résident à ${residence} de nationalité ${nationalite} né le ${dateNaissance} à ${lieuNaissance} et titulaire de la ${typeId} ${numId} délivrée le ${dateDeliv} et valable jusqu'au ${dateValid} par ${lieuDeliv}.`;
  }).join('\n\n');

  const totalApport = associates.reduce((sum, a) => sum + (Number(a.apportNumeraire) || Number(a.apport) || 0), 0);
  const defaultApport = associates.length > 0
    ? Math.floor((totalApport || capital) / associates.length)
    : 0;

  let currentStart = 1;
  const rows = associates.map((a, i) => {
    const nom = a.nom ? `${a.nom} ${a.prenoms || ''}`.trim() : a.name || `[ASSOCIE ${i + 1}]`;
    const apport = Number(a.apportNumeraire) || Number(a.apport) || defaultApport;

    const partsFromInput = Number(a.nombreParts) || Number(a.parts) || 0;
    const computedParts = valeurPart > 0 ? Math.floor(apport / valeurPart) : 0;
    const parts = partsFromInput || computedParts || (associates.length > 0 ? Math.floor(nombreParts / associates.length) : 0);

    const start = currentStart;
    const end = Math.max(start, start + parts - 1);
    currentStart = end + 1;

    return {
      identite: `${a.civilite || 'M.'} ${nom}`,
      parts: `${parts} parts numérotés de ${start} à ${end} inclus`,
      nominal: `${formatNumber(valeurPart)} FCFA`,
      souscrit: `${formatNumber(apport)} CFA`,
      versement: `${formatNumber(apport)} CFA`,
      signature: `${a.civilite || 'M.'} ${nom}`,
      partCount: parts,
    };
  });

  return {
    ...common,
    associes_identites_dsv: associesIdentitesDsv,
    tableau_dsv_identites: rows.map(r => r.identite).join('\n'),
    tableau_dsv_parts: rows.map(r => r.parts).join('\n'),
    tableau_dsv_nominal: rows.map(r => r.nominal).join('\n'),
    tableau_dsv_total_souscrit: rows.map(r => r.souscrit).join('\n'),
    tableau_dsv_versement: rows.map(r => r.versement).join('\n'),
    tableau_dsv_total_parts: String(rows.reduce((sum, r) => sum + r.partCount, 0) || nombreParts),
    tableau_signatures_noms: rows.map(r => r.signature).join('\n\n'),
    tableau_signatures_vides: rows.map(() => '').join('\n'),
    tableau_signatures: rows.map(r => ({ nom: r.signature })),
  };
};

// ============================================================
// 3bis. DSV SARL PLURI - GÉNÉRATION PROGRAMMATIQUE
//       (un rang par associé dans chaque tableau)
// ============================================================

const _dsvBorder = {
  top:    { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  left:   { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  right:  { style: BorderStyle.SINGLE, size: 1, color: '000000' },
};
const _dsvNoBorder = {
  top:    { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left:   { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right:  { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

const _dsvRun = (text, opts = {}) => new DocxTextRun({
  text,
  font: 'Times New Roman',
  size: opts.size || 22,   // 11pt comme le modèle de référence
  bold: opts.bold || false,
  italics: opts.italics || false,
  underline: opts.underline ? {} : undefined,
});

const _dsvPara = (children, opts = {}) => new DocxParagraph({
  children: Array.isArray(children) ? children : [children],
  alignment: opts.align !== undefined ? opts.align : AlignmentType.JUSTIFIED,
  spacing: opts.spacing || { after: 120 },
  indent: opts.indent,
});

const _dsvParaC = (children, opts = {}) => _dsvPara(children, { ...opts, align: AlignmentType.CENTER });
const _dsvParaL = (children, opts = {}) => _dsvPara(children, { ...opts, align: AlignmentType.LEFT });
const _dsvParaR = (children, opts = {}) => _dsvPara(children, { ...opts, align: AlignmentType.RIGHT });
const _dsvEmpty = (opts = {}) => new DocxParagraph({
  children: [new DocxTextRun({ text: '', font: 'Times New Roman', size: 22 })],
  spacing: opts.spacing || { after: 120 },
});

const _dsvCell = (children, opts = {}) => new DocxTableCell({
  children: Array.isArray(children) ? children : [children],
  borders: opts.borders || _dsvBorder,
  width: opts.width,
  margins: opts.margins || { top: 80, bottom: 80, left: 115, right: 115 },
  shading: opts.shading,
});

const buildDsvPluriDocument = (common, rows) => {
  const totalParts = rows.reduce((s, r) => s + r.partCount, 0);

  // ── Espacements (conformes au modèle de référence) ──────────
  const SP  = { after: 120 };              // Corps de texte standard
  const SPH = { before: 200, after: 80 };  // Heading1 (en-têtes de section)
  const SP0 = { after: 0 };

  // ── Marges A4 du modèle de référence (en twips) ─────────────
  // A4: 11920 × 16860 twips
  // Marges: top:1100 (couv)/1060 (contenu), bottom:420, left/right:566
  const MARGIN_COVER   = { top: 1100, bottom: 420, left: 566, right: 566, footer: 236 };
  const MARGIN_CONTENT = { top: 1060, bottom: 420, left: 566, right: 566, footer: 236 };
  const PAGE_SIZE = { width: 11920, height: 16860, orientation: PageOrientation.PORTRAIT };

  // Shading gris pour en-tête tableau signatures (EFEFEF comme modèle)
  const SHADING_GRAY = { type: 'clear', color: 'auto', fill: 'EFEFEF' };

  // Helper : cellule tableau avec marges compactes
  const TC = { top: 80, bottom: 80, left: 115, right: 115 };

  // ── PAGE 1 : COUVERTURE ─────────────────────────────────────
  // Positionnement vertical : ~40% de la hauteur de page
  const cover = [];
  for (let i = 0; i < 14; i++) cover.push(_dsvEmpty({ spacing: SP0 }));
  cover.push(_dsvParaC([_dsvRun('DSV DE LA SOCIETE', { bold: true, size: 32 })],
    { spacing: { after: 200 } }));
  cover.push(_dsvParaC([_dsvRun(`« ${common.denomination_complete} »`, { bold: true, italics: true })],
    { spacing: SP0 }));

  // ── PAGES 2-4 : CONTENU ─────────────────────────────────────
  const cc = [];

  // Encadré-titre DECLARATION DE SOUSCRIPTION ET DE VERSEMENT
  cc.push(new DocxTable({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new DocxTableRow({ children: [_dsvCell([
      _dsvParaC([_dsvRun('DECLARATION DE SOUSCRIPTION ET DE VERSEMENT', { bold: true })],
        { spacing: { after: 60 } }),
      _dsvParaC([_dsvRun(
        '(cf Art 314 de l\'Acte uniforme révisé du 30 janvier 2014, Art 6 de l\'Ordonnance N° 2014-161' +
        ' du 02 avril 2014 relative à la formes des statuts et au capital social de la société à responsabilité limitée)',
        { size: 18 })], { spacing: SP0 }),
    ], { width: { size: 100, type: WidthType.PERCENTAGE } })]}),
    ],
  }));
  cc.push(_dsvEmpty({ spacing: { after: 80 } }));

  // L'An... / Le... / Les soussignés...
  cc.push(_dsvParaL([_dsvRun(`L'An ${common.annee_lettres},`)], { spacing: SP }));
  cc.push(_dsvParaL([_dsvRun(`Le ${common.date_constitution},`)], { spacing: SP }));
  cc.push(_dsvParaL([_dsvRun('Les soussignés,')], { spacing: { after: 80 } }));

  // Identités associés — paragraphe entier en GRAS (conforme au modèle)
  for (const row of rows) {
    cc.push(_dsvPara([_dsvRun(
      `${row.nom}, ${row.profession}, résident à ${row.residence}` +
      ` de nationalité ${row.nationalite} né le ${row.dateNaissance} à ${row.lieuNaissance}` +
      ` et titulaire de la ${row.typeId} ${row.numId} délivrée le ${row.dateDeliv}` +
      ` et valable jusqu'au ${row.dateValid} par ${row.lieuDeliv}.`,
      { bold: true })], { spacing: SP }));
  }

  // I- EXPOSE PREALABLE (centré, comme le modèle)
  cc.push(_dsvParaC([_dsvRun('I- EXPOSE PREALABLE', { bold: true, underline: true })],
    { spacing: SPH }));
  cc.push(_dsvPara([_dsvRun(`Par Acte sous seing Privé en date du ${common.date_constitution},`)],
    { spacing: SP }));
  cc.push(_dsvPara([
    _dsvRun('Ont établi, les statuts de la Société à Responsabilité Limitée', { bold: true }),
    _dsvRun(' devant exister entre eux et tous propriétaires de parts sociales ultérieures,' +
            ' dont les principales caractéristiques sont les suivantes :'),
  ], { spacing: SP }));

  // 1-FORME
  cc.push(_dsvParaL([_dsvRun('1-FORME', { bold: true, underline: true })], { spacing: SPH }));
  cc.push(_dsvPara([_dsvRun(
    'La société constituée est une société à Responsabilité Limitée régie par les dispositions' +
    ' de l\'Acte uniforme révisé de l\'OHADA du 30 janvier 2014 relatif au droit des Sociétés' +
    ' commerciales et du Groupement d\'intérêt économique (GIE), ainsi que par toutes autres' +
    ' dispositions légales ou réglementaires applicables et ses présents statuts.')],
    { spacing: SP }));

  // 2- DENOMINATION
  cc.push(_dsvParaL([_dsvRun('2- DENOMINATION', { bold: true, underline: true })], { spacing: SPH }));
  cc.push(_dsvPara([
    _dsvRun('La société a pour dénomination : '),
    _dsvRun(common.denomination_complete, { bold: true }),
  ], { spacing: SP }));

  // 3- OBJET
  cc.push(_dsvParaL([_dsvRun('3- OBJET', { bold: true, underline: true })], { spacing: SPH }));
  cc.push(_dsvPara([_dsvRun('La société a pour objet en CÔTE-D\'IVOIRE :')], { spacing: SP }));
  cc.push(_dsvPara([_dsvRun(common.objet_social, { bold: true })], { spacing: SP }));
  cc.push(_dsvPara([_dsvRun(
    'et généralement, toutes opérations commerciales, financières, industrielles, mobilières' +
    ' et immobilières se rattachant directement ou indirectement à l\'objet social ou susceptibles' +
    ' d\'en faciliter l\'extension ou le développement.')], { spacing: SP }));
  cc.push(_dsvPara([_dsvRun(
    'et généralement, toutes opérations industrielles, commerciales, financières, civiles,' +
    ' mobilières ou immobilières pouvant se rattacher directement ou indirectement à l\'objet social' +
    ' ou à tous objets similaires ou connexes ou susceptibles d\'en faciliter l\'extension ou le développement.')],
    { spacing: SP }));
  cc.push(_dsvPara([_dsvRun(
    'En outre, la Société peut également participer par tous moyens, directement ou indirectement,' +
    ' dans toutes opérations pouvant se rattacher à son objet.')], { spacing: SP }));
  // Bullets standard (liste avec retrait suspendu comme le modèle)
  const bullets = [
    'l\'acquisition, la location et la vente de tous biens meubles et immeubles.',
    'l\'emprunt de toutes sommes auprès de tous établissements financiers avec possibilité de donner en garantie tout ou partie des biens sociaux.',
    'la prise en location gérance de tous fonds de commerce.',
    'la prise de participation dans toute société existante ou devant être créée',
    'et généralement, toutes opérations financières, commerciales, industrielles, mobilières et immobilières, se rapportant directement ou indirectement à l\'objet social ou pouvant en faciliter l\'extension ou le développement.',
  ];
  for (const b of bullets) {
    cc.push(new DocxParagraph({
      children: [_dsvRun(b)],
      alignment: AlignmentType.JUSTIFIED,
      spacing: SP,
      indent: { left: 720, hanging: 360 },
      bullet: { level: 0 },
    }));
  }

  // 4- SIEGE SOCIAL
  cc.push(_dsvParaL([_dsvRun('4- SIEGE SOCIAL', { bold: true, underline: true })], { spacing: SPH }));
  cc.push(_dsvPara([
    _dsvRun('Le siège social est fixé à : '),
    _dsvRun(common.siege_social_complet, { bold: true }),
  ], { spacing: SP }));

  // 5- DUREE
  cc.push(_dsvParaL([_dsvRun('5- DUREE', { bold: true, underline: true })], { spacing: SPH }));
  cc.push(_dsvPara([_dsvRun(
    `La durée de la société est de ${common.duree_societe_lettres}` +
    ` (${common.duree_societe}) années, sauf dissolution anticipée ou prorogation.`)],
    { spacing: SP }));

  // 6- CAPITAL SOCIAL
  cc.push(_dsvParaL([_dsvRun('6- CAPITAL SOCIAL', { bold: true, underline: true })], { spacing: SPH }));
  cc.push(_dsvPara([
    _dsvRun('Le capital social est fixé à la somme de '),
    _dsvRun(`${common.capital_lettres_min} Franc CFA`, { bold: true }),
    _dsvRun(` (F CFA ${common.capital_formatte}) divisé en ${common.nombre_parts}` +
            ` parts sociales de F CFA ${common.valeur_part_formatte}`),
  ], { spacing: SP }));

  // II- CONSTATATION (gauche, gras, souligné — comme le modèle)
  cc.push(_dsvParaL([_dsvRun(
    'II- CONSTATATION DE LA LIBERATION ET DU DEPOT DES FONDS PROVENANT DES PARTS SOCIALES',
    { bold: true, underline: true })], { spacing: { before: 200, after: 80 } }));
  cc.push(_dsvPara([_dsvRun(
    'Les soussignées déclarent, que les souscriptions et les versements des fonds provenant' +
    ' de la libération des parts sociales ont été effectués comme suit :')],
    { spacing: SP }));

  // Tableau de souscription — 1 rang par associé, nom en GRAS sans "M."
  cc.push(new DocxTable({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new DocxTableRow({ children: [
        _dsvCell([_dsvParaL([_dsvRun('Identité des associés et leur domicile', { bold: true })], { spacing: SP0 })],
          { width: { size: 32, type: WidthType.PERCENTAGE }, margins: TC }),
        _dsvCell([_dsvParaL([_dsvRun('Nombre de parts Souscrites', { bold: true })], { spacing: SP0 })],
          { width: { size: 22, type: WidthType.PERCENTAGE }, margins: TC }),
        _dsvCell([_dsvParaL([_dsvRun('Montant nominal', { bold: true })], { spacing: SP0 })],
          { width: { size: 14, type: WidthType.PERCENTAGE }, margins: TC }),
        _dsvCell([_dsvParaL([_dsvRun('Montant total souscrit F CFA', { bold: true })], { spacing: SP0 })],
          { width: { size: 16, type: WidthType.PERCENTAGE }, margins: TC }),
        _dsvCell([_dsvParaL([_dsvRun('Versement effectué F CFA', { bold: true })], { spacing: SP0 })],
          { width: { size: 16, type: WidthType.PERCENTAGE }, margins: TC }),
      ]}),
      ...rows.map(r => {
        // Nom sans préfixe "M." pour le tableau de souscription (conforme au modèle)
        const nomTable = r.nom.replace(/^M\.\s*/i, '');
        return new DocxTableRow({ children: [
          _dsvCell([_dsvParaL([_dsvRun(nomTable, { bold: true })], { spacing: SP0 })], { margins: TC }),
          _dsvCell([_dsvParaL([_dsvRun(r.parts)], { spacing: SP0 })], { margins: TC }),
          _dsvCell([_dsvParaL([_dsvRun(r.nominal)], { spacing: SP0 })], { margins: TC }),
          _dsvCell([_dsvParaL([_dsvRun(r.souscrit)], { spacing: SP0 })], { margins: TC }),
          _dsvCell([_dsvParaL([_dsvRun(r.versement)], { spacing: SP0 })], { margins: TC }),
        ]});
      }),
      new DocxTableRow({ children: [
        _dsvCell([_dsvParaL([_dsvRun('TOTAL', { bold: true })], { spacing: SP0 })], { margins: TC }),
        _dsvCell([_dsvParaL([_dsvRun(`${totalParts} parts`, { bold: true })], { spacing: SP0 })], { margins: TC }),
        _dsvCell([_dsvParaL([_dsvRun(`${common.valeur_part_formatte} FCFA`, { bold: true })], { spacing: SP0 })], { margins: TC }),
        _dsvCell([_dsvParaL([_dsvRun(`${common.capital_formatte} CFA`, { bold: true })], { spacing: SP0 })], { margins: TC }),
        _dsvCell([_dsvParaL([_dsvRun(`${common.capital_formatte} CFA`, { bold: true })], { spacing: SP0 })], { margins: TC }),
      ]}),
    ],
  }));
  cc.push(_dsvEmpty({ spacing: { after: 80 } }));

  // Texte de clôture
  cc.push(_dsvPara([
    _dsvRun(`La somme correspondante à l'ensemble des souscriptions et versements effectué à ce jour, de ${common.capital_lettres_min} (${common.capital_formatte} FCFA) a été déposée pour le compte de la société et conformément à la loi, dans un compte ouvert à `),
    _dsvRun(common.banque, { bold: true }),
  ], { spacing: SP }));
  cc.push(_dsvPara([_dsvRun(
    'En Foi de quoi, ils ont dressé la présente, pour servir et valoir ce que de droit',
    { bold: true, italics: true })], { spacing: { after: 200 } }));
  cc.push(new DocxParagraph({
    children: [_dsvRun(`Fait à ${common.ville}, le ${common.date_constitution}`)],
    alignment: AlignmentType.RIGHT,
    spacing: SP,
    keepNext: true,
  }));
  cc.push(new DocxParagraph({
    children: [_dsvRun('En deux (2) exemplaires originaux')],
    alignment: AlignmentType.LEFT,
    spacing: { after: 160 },
    keepNext: true,
  }));

  // Tableau de signatures — en-tête GRIS (EFEFEF comme le modèle), 1 rang par associé
  cc.push(new DocxTable({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new DocxTableRow({ children: [
        _dsvCell([_dsvParaL([_dsvRun('NOMS DES ASSOCIES', { bold: true })], { spacing: SP0 })],
          { width: { size: 60, type: WidthType.PERCENTAGE }, margins: TC, shading: SHADING_GRAY }),
        _dsvCell([_dsvParaL([_dsvRun('SIGNATURES', { bold: true })], { spacing: SP0 })],
          { width: { size: 40, type: WidthType.PERCENTAGE }, margins: TC, shading: SHADING_GRAY }),
      ]}),
      ...rows.map(r => new DocxTableRow({
        height: { value: 720, rule: 'atLeast' },
        children: [
          _dsvCell([_dsvParaL([_dsvRun(r.nom)], { spacing: SP0 })], { margins: TC }),
          _dsvCell([_dsvEmpty({ spacing: SP0 })], { margins: TC }),
        ],
      })),
    ],
  }));

  // ── Document final : 2 sections (couverture + contenu) ──────
  const footerPara = new DocxParagraph({
    children: [new DocxTextRun({ children: [DocxPageNumber.CURRENT], font: 'Times New Roman', size: 20 })],
    alignment: AlignmentType.RIGHT,
  });

  return new DocxDocument({
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 22 },
          paragraph: { spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED },
        },
      },
    },
    numbering: {
      config: [{
        reference: 'dsv-bullets',
        levels: [{
          level: 0,
          format: 'bullet',
          text: '\u2022',
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: { indent: { left: 720, hanging: 360 } },
            run: { font: 'Symbol' },
          },
        }],
      }],
    },
    sections: [
      // Section 1 : couverture (page 0 selon le modèle)
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: PAGE_SIZE,
            margin: MARGIN_COVER,
            pageNumbers: { start: 0, formatType: NumberFormat.DECIMAL },
          },
        },
        footers: {
          default: new DocxFooter({
            children: [new DocxParagraph({
              children: [new DocxTextRun({ children: [DocxPageNumber.CURRENT], font: 'Times New Roman', size: 20 })],
              alignment: AlignmentType.RIGHT,
            })],
          }),
        },
        children: cover,
      },
      // Section 2 : contenu (pages 2 à fin)
      {
        properties: {
          page: {
            size: PAGE_SIZE,
            margin: MARGIN_CONTENT,
            pageNumbers: { start: 2, formatType: NumberFormat.DECIMAL },
          },
        },
        footers: {
          default: new DocxFooter({ children: [footerPara] }),
        },
        children: cc,
      },
    ],
  });
};

const generateDsvPluriProgrammatic = async (company, associates, managers, options) => {
  const common = getCommonData(company, associates, managers);
  common._capital = Number(company.capital) || 0;
  const nombreParts = Number(common.nombre_parts) || 0;
  const valeurPart = Number(common.valeur_part) || 0;

  let currentStart = 1;
  const rows = associates.map((a, i) => {
    const nom = a.nom ? `${a.nom} ${a.prenoms || ''}`.trim() : a.name || `[ASSOCIE ${i + 1}]`;
    const apportRaw = Number(a.apportNumeraire) || Number(a.apport) || 0;
    const partsInput = Number(a.nombreParts) || Number(a.parts) || 0;
    const partsCalc = valeurPart > 0 && apportRaw > 0 ? Math.floor(apportRaw / valeurPart) : 0;
    const parts = partsInput || partsCalc || (associates.length > 0 ? Math.floor(nombreParts / associates.length) : 0);
    // Si apportNumeraire n'est pas renseigné, calculer depuis parts × valeurPart
    const apport = apportRaw || (parts * valeurPart) || Math.floor((Number(company.capital) || 0) / associates.length);
    const start = currentStart;
    const end = Math.max(start, start + parts - 1);
    currentStart = end + 1;

    return {
      nom: `${a.civilite || 'M.'} ${nom}`,
      profession: a.profession || '[PROFESSION]',
      residence: a.adresseDomicile || a.ville_residence || company.city || 'ABIDJAN',
      nationalite: a.nationalite || 'Ivoirienne',
      dateNaissance: formatDate(a.dateNaissance || a.date_naissance),
      lieuNaissance: a.lieuNaissance || a.lieu_naissance || '[LIEU]',
      typeId: a.typeIdentite || a.type_identite || 'CNI',
      numId: a.numeroIdentite || a.numero_identite || '[N°]',
      dateDeliv: formatDate(a.dateDelivranceId || a.date_delivrance_id),
      dateValid: formatDate(a.dateValiditeId || a.date_validite_id),
      lieuDeliv: a.lieuDelivranceId || a.lieu_delivrance_id || 'République de Côte d\'Ivoire',
      parts: `${parts} parts numérotés de ${start} à ${end} inclus`,
      nominal: `${formatNumber(valeurPart)} FCFA`,
      souscrit: `${formatNumber(apport)} CFA`,
      versement: `${formatNumber(apport)} CFA`,
      partCount: parts,
    };
  });

  const doc = buildDsvPluriDocument(common, rows);
  const buffer = await DocxPacker.toBuffer(doc);

  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  const timestamp = Date.now();
  const baseName = `dsv_${safeFilePart(company.company_name)}_${timestamp}`;
  const result = {};

  if (options.formats.includes('docx')) {
    const docxPath = path.join(GENERATED_DIR, `${baseName}.docx`);
    fs.writeFileSync(docxPath, buffer);
    console.log(`   ✅ DOCX généré: ${baseName}.docx (${buffer.length} bytes)`);
    result.docx = { fileName: `${baseName}.docx`, filePath: docxPath, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
  }

  if (options.formats.includes('pdf')) {
    try {
      let docxPathForPdf = result.docx?.filePath;
      if (!docxPathForPdf) {
        docxPathForPdf = path.join(GENERATED_DIR, `${baseName}_tmp.docx`);
        fs.writeFileSync(docxPathForPdf, buffer);
      }
      const pdfPath = convertDocxToPdf(docxPathForPdf, GENERATED_DIR);
      if (!result.docx) fs.existsSync(docxPathForPdf) && fs.unlinkSync(docxPathForPdf);
      const pdfFileName = path.basename(pdfPath);
      console.log(`   ✅ PDF généré: ${pdfFileName}`);
      result.pdf = { fileName: pdfFileName, filePath: pdfPath, mimeType: 'application/pdf' };
    } catch (err) {
      console.error('   ❌ Erreur PDF:', err.message);
    }
  }

  return result;
};

export const generateDsvDocx = async (company, associates = [], managers = [], additionalData = {}, options = { formats: ['pdf', 'docx'] }) => {
  console.log('\n📄 [DocxGenerator] Génération DSV...');
  const isPluri = associates && associates.length > 1;

  // SARL Pluri : génération programmatique (un rang par associé)
  if (isPluri) {
    console.log('   Mode Pluri : génération programmatique');
    return generateDsvPluriProgrammatic(company, associates, managers, options);
  }

  // SARLU : docxtemplater classique
  const data = getCommonData(company, associates, managers);
  data.associe_ville_residence = data.associe_ville_residence || data.ville;

  console.log('   Données préparées:', JSON.stringify(data, null, 2));
  return generateDocx(
    'dsv_sarlu_template.docx',
    'dsv',
    data,
    company.company_name,
    options,
  );
};

// ============================================================
// 4. LISTE DE GÉRANTS
// ============================================================

export const generateListeGerantsDocx = async (company, associates = [], managers = [], options = { formats: ['pdf', 'docx'] }) => {
  console.log('\n📄 [DocxGenerator] Génération Liste de Gérants...');
  const isPluri = managers && managers.length > 1;
  if (isPluri) {
    return generateListeGerantsPluriProgrammatic(company, associates, managers, options);
  }
  const data = getCommonData(company, associates, managers);
  // La liste des gérants décrit le gérant, pas l'associé → mapper gerant_* sur associe_*
  data.civilite = data.gerant_civilite;
  data.associe_nom_complet = data.gerant_nom_complet;
  data.associe_profession = data.gerant_profession;
  data.associe_ville_residence = data.gerant_ville_residence;
  data.associe_nationalite = data.gerant_nationalite;
  data.associe_date_naissance = data.gerant_date_naissance;
  data.associe_lieu_naissance = data.gerant_lieu_naissance;
  data.type_identite = data.gerant_type_identite;
  data.numero_identite = data.gerant_numero_identite;
  data.date_delivrance_id = data.gerant_date_delivrance_id;
  data.date_validite_id = data.gerant_date_validite_id;
  data.lieu_delivrance_id = data.gerant_lieu_delivrance_id;
  console.log('   Données préparées:', JSON.stringify(data, null, 2));
  return generateDocx('liste_gerants_sarlu_template.docx', 'liste_gerants', data, company.company_name, options);
};

// ============================================================
// 5. DÉCLARATION SUR L'HONNEUR
// ============================================================

export const generateDeclarationHonneurDocx = async (company, associates = [], managers = [], options = { formats: ['pdf', 'docx'] }) => {
  console.log('\n📄 [DocxGenerator] Génération Déclaration sur l\'honneur...');
  const isPluri = managers && managers.length > 1;
  if (isPluri) {
    return generateDeclarationPluriProgrammatic(company, associates, managers, options);
  }
  const data = getCommonData(company, associates, managers);
  // La déclaration sur l'honneur est signée par le gérant → mapper gerant_* sur associe_*
  data.associe_nom = data.gerant_nom;
  data.associe_prenoms = data.gerant_prenoms;
  data.associe_date_naissance = data.gerant_date_naissance;
  data.associe_nationalite = data.gerant_nationalite;
  data.associe_domicile = data.gerant_domicile;
  data.date_signature = formatDate(company.date_constitution || new Date().toISOString());
  console.log('   Données préparées:', JSON.stringify(data, null, 2));
  return generateDocx('declaration_honneur_sarlu_template.docx', 'declaration_honneur', data, company.company_name, options);
};

// ============================================================
// 5b. DÉCLARATION SUR L'HONNEUR - ENTREPRISE INDIVIDUELLE
// ============================================================

export const generateDeclarationHonneurEIDocx = async (company, managers = [], options = { formats: ['pdf', 'docx'] }) => {
  console.log('\n📄 [DocxGenerator] Génération Déclaration sur l\'honneur EI...');
  const proprietaire = managers[0] || {};
  const common = getCommonData(company, [], managers);

  const data = {
    ...common,
    associe_nom: proprietaire.nom || '[NOM]',
    associe_prenoms: proprietaire.prenoms || '[PRENOMS]',
    pere_nom: proprietaire.pereNom || proprietaire.pere_nom || '[NOM DU PERE]',
    mere_nom: proprietaire.mereNom || proprietaire.mere_nom || '[NOM DE LA MERE]',
    associe_date_naissance: formatDate(proprietaire.dateNaissance || proprietaire.date_naissance),
    associe_nationalite: proprietaire.nationalite || 'Ivoirienne',
    associe_domicile: proprietaire.adresse || company.city || '[DOMICILE]',
    qualite: 'Exploitant(e) individuel(le)',
    ville: company.city || 'Abidjan',
    date_signature: formatDate(company.date_constitution || new Date().toISOString()),
  };

  console.log('   Données préparées:', JSON.stringify(data, null, 2));
  return generateDocx('declaration_honneur_ei_template.docx', 'declaration_honneur', data, company.company_name, options);
};

// ============================================================
// 4b. LISTE GÉRANTS PLURI - Génération programmatique
// ============================================================

const generateListeGerantsPluriProgrammatic = async (company, associates, managers, options) => {
  console.log('\n📄 [DocxGenerator] Génération Liste Gérants Pluri (programmatique)...');
  const common = getCommonData(company, associates, managers);

  const FONT = 'Times New Roman';
  const FS = 22; // 11pt
  const t = (txt) => new DocxTextRun({ text: txt, font: FONT, size: FS });
  const b = (txt) => new DocxTextRun({ text: txt, font: FONT, size: FS, bold: true });

  const paragraphs = [];

  // En-tête
  paragraphs.push(new DocxParagraph({
    children: [b(`«${common.denomination_complete} AYANT SON SIEGE SOCIAL A ${common.siege_social_complet}»`)],
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
  }));
  paragraphs.push(new DocxParagraph({
    children: [b('-----------------------------------------------------------------------------------')],
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
  }));
  paragraphs.push(new DocxParagraph({
    children: [b(managers.length > 1 ? 'LISTE DE DIRIGEANTS' : 'LISTE DE DIRIGEANT')],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }));

  // Un paragraphe par gérant
  const nominationIntro = managers.length > 1
    ? `Sont nommés comme co-gérants de la société pour une durée de ${common.duree_mandat_lettres} (${common.duree_mandat}) ans :`
    : `Est nommé gérant de la société pour une durée de ${common.duree_mandat_lettres} (${common.duree_mandat}) ans,`;

  paragraphs.push(new DocxParagraph({
    children: [t(nominationIntro)],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 120 },
  }));

  managers.forEach((m) => {
    const nom = m.nom && m.prenoms ? `${m.nom} ${m.prenoms}`.trim() : (common.associe_nom_complet || '[NOM GERANT]');
    const prof = m.profession || '[PROFESSION]';
    const ville = m.villeResidence || m.ville_residence || company.city || 'ABIDJAN';
    const nat = m.nationalite || 'Ivoirienne';
    const dn = formatDate(m.dateNaissance || m.date_naissance);
    const ln = m.lieuNaissance || m.lieu_naissance || '[LIEU]';
    const ti = m.typeIdentite || m.type_identite || 'CNI';
    const ni = m.numeroIdentite || m.numero_identite || '[N°]';
    const dd = formatDate(m.dateDelivranceId || m.date_delivrance_id);
    const dv = formatDate(m.dateValiditeId || m.date_validite_id);

    const gerantText = `${m.civilite || 'M.'} ${nom}, ${prof}, résident à ${ville} de nationalité ${nat} née le ${dn} à ${ln} et titulaire de la ${ti} ${ni} délivré le ${dd} et valable ${dv} par la République de Côte d'Ivoire.`;
    paragraphs.push(new DocxParagraph({
      children: [t(gerantText)],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 100, after: 100 },
    }));
  });

  const doc = new DocxDocument({
    sections: [{
      properties: { page: { margin: { top: 1134, bottom: 1134, left: 1418, right: 851 } } },
      children: paragraphs,
    }],
  });

  const buffer = await DocxPacker.toBuffer(doc);
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  const timestamp = Date.now();
  const baseFileName = `liste_gerants_${safeFilePart(company.company_name)}_${timestamp}`;
  const result = {};

  if (options.formats.includes('docx')) {
    const docxPath = path.join(GENERATED_DIR, `${baseFileName}.docx`);
    fs.writeFileSync(docxPath, buffer);
    result.docx = { fileName: `${baseFileName}.docx`, filePath: docxPath, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
    console.log(`   ✅ DOCX généré: ${baseFileName}.docx`);
  }

  if (options.formats.includes('pdf')) {
    try {
      let docxPathForPdf = result.docx?.filePath;
      if (!docxPathForPdf) {
        docxPathForPdf = path.join(GENERATED_DIR, `${baseFileName}_tmp.docx`);
        fs.writeFileSync(docxPathForPdf, buffer);
      }
      const pdfPath = convertDocxToPdf(docxPathForPdf, GENERATED_DIR);
      if (!result.docx && fs.existsSync(docxPathForPdf)) fs.unlinkSync(docxPathForPdf);
      result.pdf = { fileName: path.basename(pdfPath), filePath: pdfPath, mimeType: 'application/pdf' };
      console.log(`   ✅ PDF généré: ${path.basename(pdfPath)}`);
    } catch (error) {
      console.error('   ❌ Erreur génération PDF:', error.message);
    }
  }

  return result;
};

// ============================================================
// 5b. DÉCLARATION SUR L'HONNEUR PLURI - Génération programmatique
// ============================================================

const generateDeclarationPluriProgrammatic = async (company, associates, managers, options) => {
  console.log('\n📄 [DocxGenerator] Génération Déclaration Honneur Pluri (programmatique)...');
  const common = getCommonData(company, associates, managers);
  const dateSignature = formatDate(company.date_constitution || new Date().toISOString());

  const FONT = 'Times New Roman';
  const FS = 22; // 11pt
  const t = (txt) => new DocxTextRun({ text: txt, font: FONT, size: FS });
  const b = (txt) => new DocxTextRun({ text: txt, font: FONT, size: FS, bold: true });

  const buildDeclarationSection = (m, isLast) => {
    const nom = m.nom || common.associe_nom || '[NOM]';
    const prenoms = m.prenoms || common.associe_prenoms || '[PRENOMS]';
    const pereNom = m.pereNom || m.pere_nom || '[NOM DU PERE]';
    const mereNom = m.mereNom || m.mere_nom || '[NOM DE LA MERE]';
    const dateNaiss = formatDate(m.dateNaissance || m.date_naissance);
    const nationalite = m.nationalite || 'Ivoirienne';
    const domicile = m.adresse || m.villeResidence || company.city || '[DOMICILE]';

    const paras = [
      new DocxParagraph({
        children: [b("DECLARATION SUR L'HONNEUR")],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 120 },
      }),
      new DocxParagraph({
        children: [t("(Article 47 de l'Acte Uniforme relatif au Droit commercial général adopté le 15 décembre 2010)")],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new DocxParagraph({ children: [t('NOM : '), b(nom)], spacing: { after: 80 } }),
      new DocxParagraph({ children: [t('PRENOMS : '), b(prenoms)], spacing: { after: 80 } }),
      new DocxParagraph({ children: [t('DE : '), b(pereNom)], spacing: { after: 80 } }),
      new DocxParagraph({ children: [t('Et DE : '), b(mereNom)], spacing: { after: 80 } }),
      new DocxParagraph({ children: [t('DATE DE NAISSANCE : '), b(dateNaiss)], spacing: { after: 80 } }),
      new DocxParagraph({ children: [t('NATIONALITE : '), b(nationalite)], spacing: { after: 80 } }),
      new DocxParagraph({ children: [t('DOMICILE : '), b(domicile)], spacing: { after: 80 } }),
      new DocxParagraph({ children: [t('QUALITE : '), b('GERANT')], spacing: { after: 200 } }),
      new DocxParagraph({
        children: [t("Déclare, conformément à l'article 47 de l'Acte Uniforme relatif au Droit Commercial Général adopté le 15 décembre 2010, au titre du Registre de commerce et du Crédit Mobilier, N'avoir fait l'objet d'aucune condamnation pénale, ni de sanction professionnelle ou administrative de nature à m'interdire de gérer, administrer ou diriger une société ou l'exercice d'une activité commerciale.")],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 120 },
      }),
      new DocxParagraph({
        children: [t("M'engage dans un délai de 75 jours à compter de l'immatriculation à fournir mon casier judiciaire ou tout autre document en tenant lieu.")],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 120 },
      }),
      new DocxParagraph({
        children: [t("Je prends acte de ce qu'à défaut de produire l'extrait du casier judiciaire ou tout document en tenant lieu dans le délai de soixante-quinze (75) jours, il sera procédé au retrait de mon immatriculation et à ma radiation.")],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
      new DocxParagraph({
        children: [t(`Fait à ${common.ville} le : ${dateSignature}`)],
        spacing: { after: 80 },
      }),
      new DocxParagraph({
        children: [t('(Lu et approuvé suivi de la signature)')],
        spacing: { after: isLast ? 0 : 400 },
      }),
    ];

    if (!isLast) {
      // Add a page break paragraph after the last paragraph of this section
      paras.push(new DocxParagraph({
        children: [new DocxTextRun({ text: '' })],
        pageBreakBefore: true,
        spacing: { after: 0 },
      }));
    }

    return paras;
  };

  const allParagraphs = [];
  managers.forEach((m, i) => {
    const isLast = i === managers.length - 1;
    const section = buildDeclarationSection(m, isLast);
    allParagraphs.push(...section);
  });

  const doc = new DocxDocument({
    sections: [{
      properties: { page: { margin: { top: 1134, bottom: 1134, left: 1418, right: 851 } } },
      children: allParagraphs,
    }],
  });

  const buffer = await DocxPacker.toBuffer(doc);
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  const timestamp = Date.now();
  const baseFileName = `declaration_honneur_${safeFilePart(company.company_name)}_${timestamp}`;
  const result = {};

  if (options.formats.includes('docx')) {
    const docxPath = path.join(GENERATED_DIR, `${baseFileName}.docx`);
    fs.writeFileSync(docxPath, buffer);
    result.docx = { fileName: `${baseFileName}.docx`, filePath: docxPath, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
    console.log(`   ✅ DOCX généré: ${baseFileName}.docx`);
  }

  if (options.formats.includes('pdf')) {
    try {
      let docxPathForPdf = result.docx?.filePath;
      if (!docxPathForPdf) {
        docxPathForPdf = path.join(GENERATED_DIR, `${baseFileName}_tmp.docx`);
        fs.writeFileSync(docxPathForPdf, buffer);
      }
      const pdfPath = convertDocxToPdf(docxPathForPdf, GENERATED_DIR);
      if (!result.docx && fs.existsSync(docxPathForPdf)) fs.unlinkSync(docxPathForPdf);
      result.pdf = { fileName: path.basename(pdfPath), filePath: pdfPath, mimeType: 'application/pdf' };
      console.log(`   ✅ PDF généré: ${path.basename(pdfPath)}`);
    } catch (error) {
      console.error('   ❌ Erreur génération PDF:', error.message);
    }
  }

  return result;
};

// ============================================================
// 6. STATUTS SARL PLURIPERSONNELLE
// ============================================================

const preparePluriData = (company, associates = [], managers = []) => {
  const common = getCommonData(company, associates, managers);
  const gerant = managers[0] || {};
  const associatesList = Array.isArray(associates) ? associates : [];
  const associatesCount = associatesList.length;

  const getAssociateFullName = (a, index) => {
    const composed = [a?.nom, a?.prenoms].filter(Boolean).join(' ').trim();
    return composed || a?.name || `[ASSOCIE ${index + 1}]`;
  };

  // Identités des associés (bloc texte)
  const associesIdentites = associatesList.map((a, i) => {
    const nom = getAssociateFullName(a, i);
    const profession = a.profession || '[PROFESSION]';
    const residence = a.adresseDomicile || a.ville_residence || company.city || 'ABIDJAN';
    const nationalite = a.nationalite || 'Ivoirienne';
    const dateNaissance = formatDate(a.dateNaissance || a.date_naissance);
    const lieuNaissance = a.lieuNaissance || a.lieu_naissance || '[LIEU]';
    const typeId = a.typeIdentite || a.type_identite || 'CNI';
    const numId = a.numeroIdentite || a.numero_identite || '[N°]';
    const dateDeliv = formatDate(a.dateDelivranceId || a.date_delivrance_id);
    const dateValid = formatDate(a.dateValiditeId || a.date_validite_id);
    const lieuDeliv = a.lieuDelivranceId || a.lieu_delivrance_id || 'la République de Côte d\'Ivoire';
    return `${i + 1}. ${a.civilite || 'M.'} ${nom}, ${profession} résidant à ${residence} de nationalité ${nationalite}, né le ${dateNaissance} à ${lieuNaissance} et titulaire du ${typeId} N°${numId} délivrée le ${dateDeliv} et valable jusqu'au ${dateValid} par ${lieuDeliv}.`;
  }).join('\n\n');

  // Gérant principal (managers[0]) - pour compatibilité
  const gerantNom = gerant.nom && gerant.prenoms
    ? `${gerant.nom} ${gerant.prenoms}`.trim()
    : (associatesList[0] ? getAssociateFullName(associatesList[0], 0) : (company.gerant || '[NOM GERANT]'));
  const gerantProfession = gerant.profession || '[PROFESSION]';
  const gerantResidence = gerant.adresse || gerant.villeResidence || gerant.ville_residence || company.city || 'ABIDJAN';
  const gerantNationalite = gerant.nationalite || 'Ivoirienne';
  const gerantDateNaissance = formatDate(gerant.date_naissance || gerant.dateNaissance);
  const gerantLieuNaissance = gerant.lieu_naissance || gerant.lieuNaissance || '[LIEU]';
  const gerantTypeId = gerant.type_identite || gerant.typeIdentite || 'CNI';
  const gerantNumId = gerant.numero_identite || gerant.numeroIdentite || '[N°]';
  const gerantDateDeliv = formatDate(gerant.date_delivrance_id || gerant.dateDelivranceId);
  const gerantDateValid = formatDate(gerant.date_validite_id || gerant.dateValiditeId);
  const gerantLieuDeliv = gerant.lieu_delivrance_id || gerant.lieuDelivranceId || 'la République de Côte d\'Ivoire';

  // Helper : construit l'identité complète d'un gérant (avec "qui accepte.")
  const buildGerantIdentiteFromManager = (m, index) => {
    const nom = m.nom && m.prenoms
      ? `${m.nom} ${m.prenoms}`.trim()
      : (associatesList[index] ? getAssociateFullName(associatesList[index], index) : '[NOM GERANT]');
    const prof = m.profession || '[PROFESSION]';
    const res = m.adresse || m.villeResidence || m.ville_residence || company.city || 'ABIDJAN';
    const nat = m.nationalite || 'Ivoirienne';
    const dn = formatDate(m.dateNaissance || m.date_naissance);
    const ln = m.lieuNaissance || m.lieu_naissance || '[LIEU]';
    const ti = m.typeIdentite || m.type_identite || 'CNI';
    const ni = m.numeroIdentite || m.numero_identite || '[N°]';
    const dd = formatDate(m.dateDelivranceId || m.date_delivrance_id);
    const dv = formatDate(m.dateValiditeId || m.date_validite_id);
    const ld = m.lieuDelivranceId || m.lieu_delivrance_id || "la République de Côte d'Ivoire";
    return `${m.civilite || 'M.'} ${nom}, ${prof} résidant à ${res} de nationalité ${nat}, né le ${dn} à ${ln} et titulaire du ${ti} N°${ni} délivrée le ${dd} et valable jusqu'au ${dv} par ${ld} qui accepte.`;
  };

  // Identité de tous les gérants (pour Article 15)
  const gerantIdentiteComplete = managers.length > 0
    ? managers.map((m, i) => buildGerantIdentiteFromManager(m, i)).join('\n\n')
    : `${gerant.civilite || 'M.'} ${gerantNom}, ${gerantProfession} résidant à ${gerantResidence} de nationalité ${gerantNationalite}, né le ${gerantDateNaissance} à ${gerantLieuNaissance} et titulaire du ${gerantTypeId} N°${gerantNumId} délivrée le ${gerantDateDeliv} et valable jusqu'au ${gerantDateValid} par ${gerantLieuDeliv} qui accepte.`;

  // Identité du PREMIER gérant uniquement (pour Article 31 - POUVOIRS)
  // Sans "M." et sans "qui accepte." car la phrase continue avec "à l'effet de..."
  const buildGerantIdentitePremier = (m) => {
    const nom = m.nom && m.prenoms
      ? `${m.nom} ${m.prenoms}`.trim()
      : (associatesList[0] ? getAssociateFullName(associatesList[0], 0) : '[NOM GERANT]');
    const prof = m.profession || '[PROFESSION]';
    const res = m.adresse || m.villeResidence || m.ville_residence || company.city || 'ABIDJAN';
    const nat = m.nationalite || 'Ivoirienne';
    const dn = formatDate(m.dateNaissance || m.date_naissance);
    const ln = m.lieuNaissance || m.lieu_naissance || '[LIEU]';
    const ti = m.typeIdentite || m.type_identite || 'CNI';
    const ni = m.numeroIdentite || m.numero_identite || '[N°]';
    const dd = formatDate(m.dateDelivranceId || m.date_delivrance_id);
    const dv = formatDate(m.dateValiditeId || m.date_validite_id);
    const ld = m.lieuDelivranceId || m.lieu_delivrance_id || "la République de Côte d'Ivoire";
    return `${nom}, ${prof} résidant à ${res} de nationalité ${nat}, né le ${dn} à ${ln} et titulaire du ${ti} N°${ni} délivrée le ${dd} et valable jusqu'au ${dv} par ${ld}`;
  };
  const gerantIdentitePremier = managers.length > 0
    ? buildGerantIdentitePremier(managers[0])
    : `${gerantNom}, ${gerantProfession} résidant à ${gerantResidence} de nationalité ${gerantNationalite}, né le ${gerantDateNaissance} à ${gerantLieuNaissance} et titulaire du ${gerantTypeId} N°${gerantNumId} délivrée le ${gerantDateDeliv} et valable jusqu'au ${gerantDateValid} par ${gerantLieuDeliv}`;

  // Préfixe de nomination (singulier ou pluriel)
  const gerantNominationPrefix = managers.length > 1
    ? 'Sont nommés comme co-gérants pour une durée de '
    : 'Est nommée comme gérant pour une durée de ';

  // Tableau apports
  const capital = Number(company.capital) || 0;
  const totalPartsFromAssocies = associatesList.reduce(
    (sum, a) => sum + (Number(a.nombreParts) || Number(a.parts) || 0),
    0
  );
  const nombreParts = totalPartsFromAssocies || Number(company.nombre_parts) || Math.floor(capital / 5000) || 100;
  const valeurPart = capital > 0 && nombreParts > 0
    ? Math.floor(capital / nombreParts)
    : Number(company.valeur_part) || 5000;

  const defaultApport = associatesCount > 0 ? Math.floor(capital / associatesCount) : 0;
  const defaultParts = associatesCount > 0 ? Math.floor(nombreParts / associatesCount) : 0;

  const tableauApportsNoms = associatesList.map((a, i) => {
    const nom = getAssociateFullName(a, i);
    return `${a.civilite || 'M.'} ${nom}`;
  }).join('\n');

  const tableauApportsMontants = associatesList.map(a => {
    const apportSaisi = Number(a.apportNumeraire) || Number(a.apport) || 0;
    const partsSaisies = Number(a.nombreParts) || Number(a.parts) || 0;
    const apportCalcule = partsSaisies > 0 && valeurPart > 0 ? partsSaisies * valeurPart : defaultApport;
    const apport = apportSaisi || apportCalcule;
    return `${formatNumber(apport)} F CFA`;
  }).join('\n');

  // Tableau capital
  const tableauCapitalNoms = associatesList.map((a, i) => {
    const nom = getAssociateFullName(a, i);
    return `${a.civilite || 'M.'} ${nom}`;
  }).join('\n');

  const tableauCapitalParts = associatesList.map(a => {
    const partsSaisies = Number(a.nombreParts) || Number(a.parts) || 0;
    const apportSaisi = Number(a.apportNumeraire) || Number(a.apport) || 0;
    const partsCalculees = apportSaisi > 0 && valeurPart > 0 ? Math.floor(apportSaisi / valeurPart) : defaultParts;
    const parts = partsSaisies || partsCalculees;
    return `${parts} PARTS`;
  }).join('\n');

  // Signatures
  const nomsAssocies = associatesList
    .map((a, i) => {
      const nom = getAssociateFullName(a, i);
      return nom ? `${a.civilite || 'M.'} ${nom}` : '';
    })
    .filter(Boolean);

  const signaturesAssocies = (nomsAssocies.length > 0 ? nomsAssocies : ['[ASSOCIE]']).join('\n\n');
  const tableauSignaturesNoms = (nomsAssocies.length > 0 ? nomsAssocies : ['[ASSOCIE]']).join('\n');
  const tableauSignaturesVides = (nomsAssocies.length > 0 ? nomsAssocies : ['']).map(() => '').join('\n');

  // Tableau de boucle docxtemplater : une entrée par associé
  const tableauSignatures = (nomsAssocies.length > 0 ? nomsAssocies : ['[ASSOCIE]']).map(nom => ({ nom }));

  return {
    ...common,
    nombre_parts: String(nombreParts),
    valeur_part: String(valeurPart),
    valeur_part_formatte: formatNumber(valeurPart),
    gerant_nom_complet: gerantNom,
    gerant_identite_complete: gerantIdentiteComplete,
    gerant_identite_premier: gerantIdentitePremier,
    gerant_nomination_prefix: gerantNominationPrefix,
    associes_identites: associesIdentites,
    tableau_apports_noms: tableauApportsNoms,
    tableau_apports_montants: tableauApportsMontants,
    tableau_capital_noms: tableauCapitalNoms,
    tableau_capital_parts: tableauCapitalParts,
    signatures_associes: signaturesAssocies,
    tableau_signatures_noms: tableauSignaturesNoms,
    tableau_signatures_vides: tableauSignaturesVides,
    tableau_signatures: tableauSignatures,
    // Aliases de compatibilité pour anciens templates
    tableau_signature_noms: tableauSignaturesNoms,
    tableau_signature_vides: tableauSignaturesVides,
  };
};

export const generateStatutsPluriDocx = async (company, associates = [], managers = [], options = { formats: ['pdf', 'docx'] }) => {
  console.log('\n📄 [DocxGenerator] Génération Statuts SARL Pluripersonnelle...');
  const data = preparePluriData(company, associates, managers);
  console.log('   Données préparées:', JSON.stringify(data, null, 2));
  return generateDocx('statuts_sarl_pluri_template.docx', 'statuts_sarl_pluri', data, company.company_name, options);
};

// ============================================================
// ROUTAGE - Détermine quel générateur utiliser
// ============================================================

/**
 * Vérifie si un document peut être généré avec docxtemplater
 */
export const canGenerateWithDocx = (docName, associates = []) => {
  const name = docName.toLowerCase();
  if (name.includes('cepici')) return false; // CEPICI reste en Puppeteer

  const isPluri = associates && associates.length > 1;

  // SARL Pluri : statuts, bail, DSV, liste gérants, déclaration honneur
  if (isPluri) {
    return name.includes('statut')
      || name.includes('bail')
      || name.includes('dsv')
      || name.includes('souscription')
      || name.includes('gérant') || name.includes('gerant') || name.includes('dirigeant')
      || (name.includes('déclaration') || name.includes('declaration')) && name.includes('honneur');
  }

  // SARLU : statuts, bail, DSV, liste gérants, déclaration honneur
  return name.includes('statut')
    || name.includes('bail')
    || name.includes('dsv') || name.includes('souscription')
    || name.includes('gérant') || name.includes('gerant') || name.includes('dirigeant')
    || (name.includes('déclaration') || name.includes('declaration')) && name.includes('honneur');
};

/**
 * Génère un document SARLU avec docxtemplater
 */
export const generateDocxDocument = async (docName, company, associates = [], managers = [], additionalData = {}, options = { formats: ['pdf', 'docx'] }) => {
  const name = docName.toLowerCase();
  const isPluri = associates && associates.length > 1;
  const isEI = company.company_type === 'EI' || additionalData.companyType === 'EI';

  if (name.includes('statut')) {
    if (isPluri) {
      return generateStatutsPluriDocx(company, associates, managers, options);
    }
    return generateStatutsSarluDocx(company, associates, managers, options);
  }
  if (name.includes('bail')) {
    if (isEI) return generateContratBailEIDocx(company, managers, additionalData, options);
    return generateContratBailDocx(company, associates, managers, additionalData, options);
  }
  if (name.includes('dsv') || name.includes('souscription')) {
    return generateDsvDocx(company, associates, managers, additionalData, options);
  }
  if (name.includes('gérant') || name.includes('gerant') || name.includes('dirigeant')) {
    return generateListeGerantsDocx(company, associates, managers, options);
  }
  if ((name.includes('déclaration') || name.includes('declaration')) && name.includes('honneur')) {
    if (isEI) return generateDeclarationHonneurEIDocx(company, managers, options);
    return generateDeclarationHonneurDocx(company, associates, managers, options);
  }

  throw new Error(`Document non supporté par docxGenerator: ${docName}`);
};
