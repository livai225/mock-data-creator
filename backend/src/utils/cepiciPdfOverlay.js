/**
 * Générateur PDF CEPICI par overlay sur gabarit officiel
 * Utilise pdf-lib pour écrire les champs directement sur le PDF modèle
 * Coordonnées calibrées sur formulaire-unique*.pdf (models_ecriture)
 */

import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Conversion mm → points PDF (1 inch = 72 pt = 25.4 mm)
const mmToPt = (mm) => (mm * 72) / 25.4;

// Formatage date JJ/MM/AAAA
const formatDateDMY = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return String(dateStr);
  }
};

// Formatage nombre avec séparateur milliers
const formatNumber = (n) => {
  if (n == null || n === '') return '';
  const num = Number(n);
  if (isNaN(num)) return String(n);
  return Math.trunc(num).toLocaleString('fr-FR');
};

const resolveModelsDir = () => {
  const thisFile = new URL(import.meta.url).pathname;
  // Sur Windows, enlever le leading slash si présent (ex: /C:/...)
  const normalizedThisFile = process.platform === 'win32' && thisFile.startsWith('/') 
    ? thisFile.slice(1) 
    : thisFile;
  const backendSrc = path.dirname(normalizedThisFile);
  
  const candidates = [
    path.resolve(process.cwd(), 'models_ecriture'),
    path.resolve(process.cwd(), '..', 'models_ecriture'),
    path.resolve(process.cwd(), '..', '..', 'models_ecriture'),
    path.resolve(backendSrc, '..', '..', '..', 'models_ecriture'),
    '/var/www/mock-data-creator/models_ecriture'
  ];

  console.log(`   🔍 [resolveModelsDir] Recherche models_ecriture...`);
  for (const p of candidates) {
    const exists = fs.existsSync(p);
    console.log(`      - ${p}: ${exists ? '✅' : '❌'}`);
    if (exists && fs.statSync(p).isDirectory()) return p;
  }

  throw new Error(`models_ecriture introuvable. Candidats testés: ${candidates.join(', ')}`);
};

const getCepiciTemplatePath = (associates = []) => {
  const modelsDir = resolveModelsDir();
  const isUni = !associates || associates.length <= 1;

  const rel = isUni
    ? path.join('SARL UNIPERSONNELLE', 'formulaire-unique.pdf')
    : path.join('SARL PLURIPERSONEL', 'formulaire-unique HYDRA FOR.pdf');

  const full = path.join(modelsDir, rel);
  if (!fs.existsSync(full)) {
    throw new Error(`Gabarit CEPICI introuvable: ${full}`);
  }

  return full;
};

const sanitizePdfText = (value) => {
  if (value == null) return '';
  return String(value)
    .replace(/[\u202F\u00A0]/g, ' ') // espaces insécables
    .replace(/[\u2019\u2018]/g, "'") // apostrophes
    .replace(/[\u2013\u2014]/g, '-') // tirets
    .replace(/[\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const asUpper = (v) => sanitizePdfText(v).toUpperCase();
const asText = (v) => sanitizePdfText(v);

/**
 * Dessine du texte à une position (mm depuis haut-gauche).
 * Gère le retour à la ligne si maxWidth est fourni.
 */
const drawTextTopLeftMm = (page, text, leftMm, topMm, opts = {}) => {
  const value = asText(text);
  if (!value) return;

  const { size = 9, font, maxWidth, color = rgb(0, 0, 0), singleLine = false } = opts;
  const x = mmToPt(leftMm);
  const y = page.getHeight() - mmToPt(topMm);

  if (!maxWidth) {
    page.drawText(value, { x, y, size, font, color });
    return;
  }

  const maxWidthPt = mmToPt(maxWidth);
  if (singleLine) {
    let fitted = value;
    if (font.widthOfTextAtSize(fitted, size) > maxWidthPt) {
      const suffix = '...';
      let trimmed = fitted;
      while (trimmed.length > 0 && font.widthOfTextAtSize(trimmed + suffix, size) > maxWidthPt) {
        trimmed = trimmed.slice(0, -1);
      }
      fitted = trimmed ? trimmed + suffix : '';
    }
    if (fitted) {
      page.drawText(fitted, { x, y, size, font, color });
    }
    return;
  }
  const words = value.split(/\s+/g);
  let line = '';
  let cursorY = y;
  const lineHeight = size + 2;

  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width <= maxWidthPt) {
      line = test;
      continue;
    }

    if (line) {
      page.drawText(line, { x, y: cursorY, size, font, color });
      cursorY -= lineHeight;
      line = w;
    } else {
      page.drawText(test, { x, y: cursorY, size, font, color });
      cursorY -= lineHeight;
      line = '';
    }
  }

  if (line) {
    page.drawText(line, { x, y: cursorY, size, font, color });
  }
};

/**
 * Normalise toutes les données pour le formulaire CEPICI
 */
const normalizeCepiciData = (company, managers = [], associates = [], additionalData = {}) => {
  const gerant = managers && managers.length > 0 ? managers[0] : null;

  const declarant = additionalData.declarant || company.declarant || {};
  const projections = additionalData.projections || company.projections || {};

  const capital = Number(company.capital || 0) || 0;
  const dureeSociete = company.duree_societe || company.dureeSociete || 99;

  const commune = additionalData.commune || company.commune || '';
  const quartier = additionalData.quartier || company.quartier || '';
  const lot = additionalData.lot || company.lot || '';
  const ilot = additionalData.ilot || company.ilot || '';
  const nomImmeuble = additionalData.nomImmeuble || additionalData.nom_immeuble || company.nomImmeuble || company.nom_immeuble || '';
  const numeroEtage = additionalData.numeroEtage || additionalData.numero_etage || company.numeroEtage || company.numero_etage || '';
  const numeroPorte = additionalData.numeroPorte || additionalData.numero_porte || company.numeroPorte || company.numero_porte || '';
  const section = additionalData.section || company.section || '';
  const parcelle = additionalData.parcelle || company.parcelle || '';
  const tfNumero = additionalData.tfNumero || additionalData.tf_numero || company.tfNumero || company.tf_numero || '';
  const fax = additionalData.fax || company.fax || '';
  const adressePostale = additionalData.adressePostale || additionalData.adresse_postale || company.adressePostale || company.adresse_postale || '';

  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : '';
  const gerantAdresse = gerant?.adresse || gerant?.address || '';
  const gerantNationalite = gerant?.nationalite || gerant?.nationality || '';
  const gerantDateNaissance = gerant?.date_naissance || gerant?.dateNaissance || '';
  const gerantLieuNaissance = gerant?.lieu_naissance || gerant?.lieuNaissance || '';
  const gerantProfession = gerant?.profession || '';
  const gerantTypeId = gerant?.type_identite || gerant?.typeIdentite || '';
  const gerantNumId = gerant?.numero_identite || gerant?.numeroIdentite || '';
  const gerantDateDelivranceId = gerant?.date_delivrance_id || gerant?.dateDelivranceId || '';
  const gerantDateValiditeId = gerant?.date_validite_id || gerant?.dateValiditeId || '';
  const gerantLieuDelivranceId = gerant?.lieu_delivrance_id || gerant?.lieuDelivranceId || '';
  const gerantVilleResidence = gerant?.ville_residence || gerant?.villeResidence || '';
  const gerantPereNom = gerant?.pere_nom || gerant?.pereNom || '';
  const gerantMereNom = gerant?.mere_nom || gerant?.mereNom || '';
  const gerantRegimeMatrimonial = gerant?.regime_matrimonial || gerant?.regimeMatrimonial || '';

  return {
    companyName: company.company_name || '',
    sigle: company.sigle || '',
    dureeSociete: String(dureeSociete),
    capital: formatNumber(capital),
    capitalNumeraire: formatNumber(capital),
    apportsNature: '0',
    formeJuridique: 'SARL' + ((!associates || associates.length <= 1) ? ' U' : ''),
    activitePrincipale: company.activity || '',
    activitesSecondaires: company.activites_secondaires || additionalData.activites_secondaires || '',
    chiffreAffairesPrev: formatNumber(company.chiffre_affaires_prev || additionalData.chiffre_affaires_prev || ''),
    nombreEmployes: additionalData.nombre_employes || '1',
    dateEmbauchePremier: formatDateDMY(additionalData.date_embauche_premier || new Date().toISOString()),
    dateDebutActivite: formatDateDMY(additionalData.date_debut_activite || new Date().toISOString()),

    declarantNom: declarant.nom || additionalData.declarant_nom || gerantNom,
    declarantQualite: declarant.qualite || additionalData.declarant_qualite || 'CONSULTANT COMPTABLE',
    declarantNumCC: declarant.num_cc || additionalData.declarant_num_cc || '',
    declarantAdresse: declarant.adresse || additionalData.declarant_adresse || gerantAdresse,
    declarantTel: declarant.telephone || additionalData.declarant_telephone || company.telephone || '',
    declarantFax: declarant.fax || additionalData.declarant_fax || fax,
    declarantMobile: declarant.mobile || additionalData.declarant_mobile || '',
    declarantEmail: declarant.email || additionalData.declarant_email || company.email || '',

    investAnnee1: formatNumber(projections.investissement_annee1 || projections.investissementAnnee1 || additionalData.investissement_annee1 || ''),
    investAnnee2: formatNumber(projections.investissement_annee2 || projections.investissementAnnee2 || additionalData.investissement_annee2 || ''),
    investAnnee3: formatNumber(projections.investissement_annee3 || projections.investissementAnnee3 || additionalData.investissement_annee3 || ''),
    emploisAnnee1: projections.emplois_annee1 || projections.emploisAnnee1 || additionalData.emplois_annee1 || '',
    emploisAnnee2: projections.emplois_annee2 || projections.emploisAnnee2 || additionalData.emplois_annee2 || '',
    emploisAnnee3: projections.emplois_annee3 || projections.emploisAnnee3 || additionalData.emplois_annee3 || '',

    ville: company.city || 'ABIDJAN',
    commune,
    quartier,
    rue: company.address || '',
    lot,
    ilot,
    nomImmeuble,
    numeroEtage,
    numeroPorte,
    section,
    parcelle,
    tfNumero,
    telephone: company.telephone || '',
    fax,
    adressePostale,
    email: company.email || '',

    gerantNom,
    gerantNationalite,
    gerantDateNaissance: formatDateDMY(gerantDateNaissance),
    gerantLieuNaissance,
    gerantAdresse,
    gerantProfession,
    gerantTypeId,
    gerantNumId,
    gerantDateDelivranceId: formatDateDMY(gerantDateDelivranceId),
    gerantDateValiditeId: formatDateDMY(gerantDateValiditeId),
    gerantLieuDelivranceId,
    gerantVilleResidence,
    gerantPereNom,
    gerantMereNom,
    gerantRegimeMatrimonial,

    associates: (associates || []).map(a => ({
      nom: `${a.nom || ''} ${a.prenoms || ''}`.trim() || a.name || '',
      adresse: a.adresse || a.address || a.adresseDomicile || '',
      nationalite: a.nationalite || a.nationality || '',
      dateNaissance: formatDateDMY(a.date_naissance || a.dateNaissance || ''),
      lieuNaissance: a.lieu_naissance || a.lieuNaissance || '',
      profession: a.profession || '',
      pereNom: a.pere_nom || a.pereNom || '',
      mereNom: a.mere_nom || a.mereNom || '',
      regimeMatrimonial: a.regime_matrimonial || a.regimeMatrimonial || '',
      villeResidence: a.ville_residence || a.villeResidence || ''
    }))
  };
};

/**
 * Génère un PDF CEPICI en utilisant le PDF modèle comme gabarit, puis en écrivant les champs par-dessus.
 * Coordonnées calibrées sur le formulaire officiel (mm depuis haut-gauche de chaque page).
 */
export const generateCepiciPdfFromTemplate = async (company, managers = [], associates = [], additionalData = {}, outputPath) => {
  console.log('🧾 [CEPICI Overlay] Début génération...');
  console.log(`   📁 CWD: ${process.cwd()}`);
  
  let templatePath;
  try {
    templatePath = getCepiciTemplatePath(associates);
    console.log(`   📄 Gabarit: ${templatePath}`);
  } catch (pathError) {
    console.error('❌ [CEPICI] Erreur récupération chemin template:', pathError.message);
    throw pathError;
  }
  
  let templateBytes;
  try {
    templateBytes = fs.readFileSync(templatePath);
    console.log(`   ✅ Template lu: ${templateBytes.length} bytes`);
  } catch (readError) {
    console.error(`❌ [CEPICI] Erreur lecture template: ${readError.message}`);
    throw new Error(`Impossible de lire le gabarit CEPICI: ${templatePath}`);
  }
  
  const pdfDoc = await PDFDocument.load(templateBytes);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pages = pdfDoc.getPages();
  if (!pages.length) throw new Error('Gabarit CEPICI invalide: aucune page');

  const d = normalizeCepiciData(company, managers, associates, additionalData);
  console.log('   📋 Données normalisées:', JSON.stringify(d, null, 2));

  // ============================================================
  // PAGE 1: Déclarant + Projections
  // ============================================================
  const p1 = pages[0];
  
  // --- DÉCLARANT RESPONSABLE POUR L'ACCOMPLISSEMENT DES FORMALITÉS ---
  // "DECLARATION ETABLIE PAR :" - valeur après les pointillés (x=60mm, y=168mm)
  drawTextTopLeftMm(p1, asUpper(d.declarantNom), 60, 168, { font: boldFont, size: 8, maxWidth: 140, singleLine: true });
  
  // "AGISSANT EN QUALITE DE :" (y=174mm)
  drawTextTopLeftMm(p1, asUpper(d.declarantQualite), 55, 174, { font: boldFont, size: 8, maxWidth: 145, singleLine: true });
  
  // "NUMERO DE COMPTE CONTRIBUABLE" (y=180mm)
  drawTextTopLeftMm(p1, asText(d.declarantNumCC), 72, 180, { font: boldFont, size: 8, maxWidth: 120, singleLine: true });
  
  // "ADRESSE PERSONNELLE" (y=186mm)
  drawTextTopLeftMm(p1, asUpper(d.declarantAdresse), 52, 186, { font: boldFont, size: 7, maxWidth: 150, singleLine: true });
  
  // TEL / FAX (y=198mm) - TEL à x=18mm, FAX à x=105mm
  drawTextTopLeftMm(p1, asText(d.declarantTel), 18, 198, { font: boldFont, size: 8, singleLine: true });
  drawTextTopLeftMm(p1, asText(d.declarantFax), 105, 198, { font: boldFont, size: 8, singleLine: true });
  
  // MOBILE / E-MAIL (y=204mm)
  drawTextTopLeftMm(p1, asText(d.declarantMobile), 25, 204, { font: boldFont, size: 8, singleLine: true });
  drawTextTopLeftMm(p1, asText(d.declarantEmail), 105, 204, { font: boldFont, size: 7, maxWidth: 95, singleLine: true });

  // --- Tableau projections (en bas de page 1) ---
  // Colonnes: ANNÉE 1 (centre ~115mm) | ANNÉE 2 (centre ~152mm) | ANNÉE 3 (centre ~189mm)
  // Ligne "Montant d'Investissement (projeté)" y=238mm
  drawTextTopLeftMm(p1, d.investAnnee1, 115, 238, { font: boldFont, size: 9 });
  drawTextTopLeftMm(p1, d.investAnnee2, 152, 238, { font: boldFont, size: 9 });
  drawTextTopLeftMm(p1, d.investAnnee3, 189, 238, { font: boldFont, size: 9 });
  
  // Ligne "Nombre d'Emplois (projetés)" y=252mm
  drawTextTopLeftMm(p1, d.emploisAnnee1, 115, 252, { font: boldFont, size: 9 });
  drawTextTopLeftMm(p1, d.emploisAnnee2, 152, 252, { font: boldFont, size: 9 });
  drawTextTopLeftMm(p1, d.emploisAnnee3, 189, 252, { font: boldFont, size: 9 });

  // ============================================================
  // PAGE 2: I- Identification + II- Activité + III- Localisation + V- Infos associés
  // ============================================================
  if (pages[1]) {
    const p2 = pages[1];
    
    // --- I- IDENTIFICATION (commence vers y=8mm) ---
    // Dénomination sociale : valeur après pointillés (x=48mm, y=14mm)
    drawTextTopLeftMm(p2, `${asUpper(d.companyName)} SARL`, 48, 14, { font: boldFont, size: 8, maxWidth: 150, singleLine: true });
    
    // Nom commercial (y=20mm)
    drawTextTopLeftMm(p2, asUpper(d.companyName), 40, 20, { font: boldFont, size: 8, maxWidth: 155, singleLine: true });
    
    // Sigle (y=26mm)
    drawTextTopLeftMm(p2, asUpper(d.sigle), 18, 26, { font: boldFont, size: 8, maxWidth: 180, singleLine: true });
    
    // Durée (y=32mm)
    drawTextTopLeftMm(p2, `${d.dureeSociete} ANS`, 18, 32, { font: boldFont, size: 8 });
    
    // Forme juridique (y=38mm)
    drawTextTopLeftMm(p2, d.formeJuridique, 42, 38, { font: boldFont, size: 8 });
    
    // Montant du capital (y=44mm) | Dont Montant en numéraire (x=120mm)
    drawTextTopLeftMm(p2, `${d.capital} FCFA`, 45, 44, { font: boldFont, size: 8 });
    drawTextTopLeftMm(p2, `${d.capitalNumeraire} FCFA`, 120, 44, { font: boldFont, size: 8 });
    
    // Évaluation des apports en nature (y=50mm, x=72mm)
    drawTextTopLeftMm(p2, d.apportsNature || '0', 72, 50, { font: boldFont, size: 8 });

    // --- II- ACTIVITÉ (renseignements sur la personne morale) y~56mm ---
    // Activité principale (y=62mm)
    drawTextTopLeftMm(p2, asText(d.activitePrincipale), 42, 62, { font: boldFont, size: 6, maxWidth: 160, singleLine: true });
    
    // Activités secondaires (y=68mm)
    if (d.activitesSecondaires) {
      drawTextTopLeftMm(p2, asText(d.activitesSecondaires), 48, 68, { font, size: 6, maxWidth: 155, singleLine: true });
    }
    
    // Chiffre d'affaires prévisionnel (y=74mm)
    drawTextTopLeftMm(p2, d.chiffreAffairesPrev ? `${d.chiffreAffairesPrev} FCFA` : '', 58, 74, { font: boldFont, size: 8 });
    
    // Nombre d'employés (y=80mm) | Date embauche 1er employé (x=132mm)
    drawTextTopLeftMm(p2, d.nombreEmployes, 45, 80, { font: boldFont, size: 8 });
    drawTextTopLeftMm(p2, d.dateEmbauchePremier, 132, 80, { font: boldFont, size: 8 });
    
    // Date de début d'activité (y=86mm)
    drawTextTopLeftMm(p2, d.dateDebutActivite, 52, 86, { font: boldFont, size: 8 });

    // --- III- LOCALISATION DU SIÈGE SOCIAL / DE LA SUCCURSALE (y~92mm) ---
    // Ville (y=98mm, x=18mm) | Commune (x=75mm)
    drawTextTopLeftMm(p2, asUpper(d.ville), 18, 98, { font: boldFont, size: 8 });
    drawTextTopLeftMm(p2, asUpper(d.commune), 75, 98, { font: boldFont, size: 8, maxWidth: 50, singleLine: true });
    
    // Quartier (y=104mm, x=28mm) | Rue (x=100mm)
    drawTextTopLeftMm(p2, asUpper(d.quartier), 28, 104, { font: boldFont, size: 7, maxWidth: 60, singleLine: true });
    drawTextTopLeftMm(p2, asUpper(d.rue), 100, 104, { font: boldFont, size: 7, maxWidth: 95, singleLine: true });
    
    // Lot n° (y=110mm, x=25mm) | Ilot (x=85mm)
    drawTextTopLeftMm(p2, d.lot, 25, 110, { font: boldFont, size: 8 });
    drawTextTopLeftMm(p2, d.ilot, 85, 110, { font: boldFont, size: 8 });
    
    // Nom immeuble (y=116mm, x=42mm) | Numéro étage (x=108mm) | Numéro porte (x=160mm)
    drawTextTopLeftMm(p2, asUpper(d.nomImmeuble), 42, 116, { font: boldFont, size: 7, maxWidth: 60, singleLine: true });
    drawTextTopLeftMm(p2, d.numeroEtage, 108, 116, { font: boldFont, size: 8 });
    drawTextTopLeftMm(p2, d.numeroPorte, 160, 116, { font: boldFont, size: 8 });
    
    // Section (y=122mm, x=28mm) | Parcelle (x=100mm)
    drawTextTopLeftMm(p2, d.section, 28, 122, { font: boldFont, size: 8 });
    drawTextTopLeftMm(p2, d.parcelle, 100, 122, { font: boldFont, size: 8 });
    
    // TF n° (y=128mm)
    drawTextTopLeftMm(p2, d.tfNumero, 22, 128, { font: boldFont, size: 8 });
    
    // Tél (y=134mm) | Fax (x=100mm)
    drawTextTopLeftMm(p2, d.telephone, 18, 134, { font: boldFont, size: 8 });
    drawTextTopLeftMm(p2, d.fax, 100, 134, { font: boldFont, size: 8 });
    
    // Adresse postale (y=140mm) | Email (x=115mm)
    drawTextTopLeftMm(p2, d.adressePostale, 42, 140, { font: boldFont, size: 7, maxWidth: 65, singleLine: true });
    drawTextTopLeftMm(p2, d.email, 115, 140, { font: boldFont, size: 7, maxWidth: 80, singleLine: true });

    // --- V- INFORMATIONS SUR LES DIRIGEANTS, ACTIONNAIRES (y~172mm) ---
    // Tableau associés - colonnes: 1 (x=80mm) | 2 (x=130mm) | 3 (x=175mm)
    // Première ligne du tableau (Nom et Prénoms) y=205mm
    const assocTableY = 205;
    const assocRowH = 6;
    
    d.associates.forEach((assoc, idx) => {
      if (idx >= 3) return;
      const colX = 80 + (idx * 50); // 80mm, 130mm, 180mm
      
      // Nom et Prénoms (row 0)
      drawTextTopLeftMm(p2, asUpper(assoc.nom), colX, assocTableY, { font: boldFont, size: 6, maxWidth: 45, singleLine: true });
      // Adresse (row 1)
      drawTextTopLeftMm(p2, asUpper(assoc.adresse), colX, assocTableY + assocRowH, { font, size: 5, maxWidth: 45, singleLine: true });
      // Nationalité (row 2)
      drawTextTopLeftMm(p2, assoc.nationalite, colX, assocTableY + (assocRowH * 2), { font, size: 6, maxWidth: 45, singleLine: true });
      // Date et lieu naissance (row 3)
      drawTextTopLeftMm(p2, `${assoc.dateNaissance} ${assoc.lieuNaissance}`, colX, assocTableY + (assocRowH * 3), { font, size: 5, maxWidth: 45, singleLine: true });
      // Régime matrimonial (row 4)
      drawTextTopLeftMm(p2, assoc.regimeMatrimonial, colX, assocTableY + (assocRowH * 4), { font, size: 6, maxWidth: 45, singleLine: true });
      // Clauses opposables (row 5 - vide)
      // Domicile (row 6)
      drawTextTopLeftMm(p2, assoc.villeResidence || assoc.adresse, colX, assocTableY + (assocRowH * 6), { font, size: 5, maxWidth: 45, singleLine: true });
    });
  }

  // ============================================================
  // PAGE 3: Dirigeants sociaux + Commissaires + Signature
  // ============================================================
  if (pages[2]) {
    const p3 = pages[2];

    // --- Dirigeants sociaux (tableau) ---
    // Colonnes: 1 (x=80mm) | 2 (x=130mm) | 3 (x=175mm)
    // Première ligne (Nom et Prénoms) y=28mm
    const dirigTableY = 28;
    const dirigRowH = 8;
    
    // Colonne 1: Gérant principal
    // Nom et Prénoms (row 0)
    drawTextTopLeftMm(p3, asUpper(d.gerantNom), 80, dirigTableY, { font: boldFont, size: 6, maxWidth: 45, singleLine: true });
    // Nom de jeune fille (row 1 - vide)
    // Date et lieu de naissance (row 2)
    drawTextTopLeftMm(p3, `le ${d.gerantDateNaissance} à ${d.gerantLieuNaissance}`, 80, dirigTableY + (dirigRowH * 2), { font, size: 5, maxWidth: 45, singleLine: true });
    // Fonction (row 3)
    drawTextTopLeftMm(p3, 'GERANT', 80, dirigTableY + (dirigRowH * 3), { font: boldFont, size: 6 });
    // Domicile (row 4)
    drawTextTopLeftMm(p3, asUpper(d.gerantAdresse), 80, dirigTableY + (dirigRowH * 4), { font, size: 5, maxWidth: 45, singleLine: true });
    // Téléphone et adresse postale (row 5)
    drawTextTopLeftMm(p3, d.telephone, 80, dirigTableY + (dirigRowH * 5), { font, size: 6, maxWidth: 45, singleLine: true });
    // Situation matrimoniale (row 6)
    drawTextTopLeftMm(p3, d.gerantRegimeMatrimonial, 80, dirigTableY + (dirigRowH * 6), { font, size: 6, maxWidth: 45, singleLine: true });

    // --- Commissaires aux comptes (vide pour SARL) ---

    // --- Date et signature (en bas) ---
    // "Fait à Abidjan, le" - x=50mm, y=205mm
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    drawTextTopLeftMm(p3, dateStr, 50, 205, { font: boldFont, size: 9 });
  }

  // ============================================================
  // PAGE 4+ : Si le PDF modèle a plus de pages (signature, etc.)
  // ============================================================
  // On laisse les pages suivantes intactes (elles contiennent généralement
  // des instructions ou des cadres de signature vides)

  const outBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, outBytes);
  console.log(`   ✅ [CEPICI Overlay] PDF généré: ${outputPath}`);
  return outputPath;
};

export default {
  generateCepiciPdfFromTemplate
};
