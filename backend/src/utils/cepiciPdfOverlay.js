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
  // Section commence vers 156mm depuis le haut
  // "DECLARATION ETABLIE PAR :" valeur après x=62mm, y=162mm
  drawTextTopLeftMm(p1, asUpper(d.declarantNom), 62, 162, { font: boldFont, size: 9, maxWidth: 130, singleLine: true });
  
  // "AGISSANT EN QUALITE DE :" valeur après x=55mm, y=168mm
  drawTextTopLeftMm(p1, asUpper(d.declarantQualite), 55, 168, { font: boldFont, size: 9, maxWidth: 140, singleLine: true });
  
  // "NUMERO DE COMPTE CONTRIBUABLE" valeur après x=75mm, y=174mm
  drawTextTopLeftMm(p1, asText(d.declarantNumCC), 75, 174, { font: boldFont, size: 9, maxWidth: 100, singleLine: true });
  
  // "ADRESSE PERSONNELLE" valeur après x=55mm, y=180mm
  drawTextTopLeftMm(p1, asUpper(d.declarantAdresse), 55, 180, { font: boldFont, size: 8, maxWidth: 145, singleLine: true });
  
  // TEL / FAX - y=192mm
  drawTextTopLeftMm(p1, asText(d.declarantTel), 22, 192, { font: boldFont, size: 9, singleLine: true });
  drawTextTopLeftMm(p1, asText(d.declarantFax), 95, 192, { font: boldFont, size: 9, singleLine: true });
  
  // MOBILE / E-MAIL - y=198mm
  drawTextTopLeftMm(p1, asText(d.declarantMobile), 28, 198, { font: boldFont, size: 9, singleLine: true });
  drawTextTopLeftMm(p1, asText(d.declarantEmail), 95, 198, { font: boldFont, size: 8, maxWidth: 100, singleLine: true });

  // --- Tableau projections (en bas de page 1) ---
  // Colonnes centrées: ANNÉE 1 (x~118mm) | ANNÉE 2 (x~152mm) | ANNÉE 3 (x~186mm)
  // Ligne "Montant d'Investissement (projeté)" y=230mm
  drawTextTopLeftMm(p1, d.investAnnee1, 118, 230, { font: boldFont, size: 9 });
  drawTextTopLeftMm(p1, d.investAnnee2, 152, 230, { font: boldFont, size: 9 });
  drawTextTopLeftMm(p1, d.investAnnee3, 186, 230, { font: boldFont, size: 9 });
  
  // Ligne "Nombre d'Emplois (projetés)" y=246mm
  drawTextTopLeftMm(p1, d.emploisAnnee1, 118, 246, { font: boldFont, size: 9 });
  drawTextTopLeftMm(p1, d.emploisAnnee2, 152, 246, { font: boldFont, size: 9 });
  drawTextTopLeftMm(p1, d.emploisAnnee3, 186, 246, { font: boldFont, size: 9 });

  // ============================================================
  // PAGE 2: I- Identification + II- Activité + III- Localisation + V- Infos dirigeants
  // ============================================================
  if (pages[1]) {
    const p2 = pages[1];
    
    // --- I- IDENTIFICATION ---
    // Dénomination sociale : valeur après x=55mm, y=13mm
    drawTextTopLeftMm(p2, `${asUpper(d.companyName)} SARL`, 55, 13, { font: boldFont, size: 9, maxWidth: 140, singleLine: true });
    
    // Nom commercial : valeur après x=45mm, y=19mm
    drawTextTopLeftMm(p2, asUpper(d.companyName), 45, 19, { font: boldFont, size: 9, maxWidth: 150, singleLine: true });
    
    // Sigle : valeur après x=22mm, y=25mm
    drawTextTopLeftMm(p2, asUpper(d.sigle), 22, 25, { font: boldFont, size: 9, maxWidth: 80, singleLine: true });
    
    // Durée : valeur après x=22mm, y=33mm
    drawTextTopLeftMm(p2, `${d.dureeSociete} ANS`, 22, 33, { font: boldFont, size: 9 });
    
    // Forme juridique : valeur après x=45mm, y=39mm
    drawTextTopLeftMm(p2, d.formeJuridique, 45, 39, { font: boldFont, size: 9 });
    
    // Montant du capital : x=48mm, y=45mm | Dont Montant en numéraire : x=130mm
    drawTextTopLeftMm(p2, `${d.capital} FCFA`, 48, 45, { font: boldFont, size: 9 });
    drawTextTopLeftMm(p2, `${d.capitalNumeraire} FCFA`, 130, 45, { font: boldFont, size: 9 });
    
    // Évaluation des apports en nature : x=75mm, y=51mm
    drawTextTopLeftMm(p2, d.apportsNature || '0', 75, 51, { font: boldFont, size: 9 });

    // --- II- ACTIVITÉ (renseignements sur la personne morale) ---
    // Activité principale : x=45mm, y=61mm
    drawTextTopLeftMm(p2, asText(d.activitePrincipale), 45, 61, { font: boldFont, size: 7, maxWidth: 155, singleLine: true });
    
    // Activités secondaires : x=50mm, y=73mm
    if (d.activitesSecondaires) {
      drawTextTopLeftMm(p2, asText(d.activitesSecondaires), 50, 73, { font, size: 7, maxWidth: 150, singleLine: true });
    }
    
    // Chiffre d'affaires prévisionnel : x=60mm, y=79mm
    drawTextTopLeftMm(p2, d.chiffreAffairesPrev ? `${d.chiffreAffairesPrev} FCFA` : '', 60, 79, { font: boldFont, size: 9 });
    
    // Nombre d'employés : x=48mm, y=85mm | Date embauche 1er employé : x=140mm
    drawTextTopLeftMm(p2, d.nombreEmployes, 48, 85, { font: boldFont, size: 9 });
    drawTextTopLeftMm(p2, d.dateEmbauchePremier, 140, 85, { font: boldFont, size: 9 });
    
    // Date de début d'activité : x=55mm, y=91mm
    drawTextTopLeftMm(p2, d.dateDebutActivite, 55, 91, { font: boldFont, size: 9 });

    // --- III- LOCALISATION DU SIÈGE SOCIAL / DE LA SUCCURSALE ---
    // Ville : x=22mm, y=101mm | Commune : x=75mm
    drawTextTopLeftMm(p2, asUpper(d.ville), 22, 101, { font: boldFont, size: 9 });
    drawTextTopLeftMm(p2, asUpper(d.commune), 75, 101, { font: boldFont, size: 9, maxWidth: 50, singleLine: true });
    // Quartier : x=95mm | (sur la même ligne que ville/commune pour ce template)
    drawTextTopLeftMm(p2, asUpper(d.quartier), 120, 101, { font: boldFont, size: 8, maxWidth: 70, singleLine: true });
    
    // Rue : x=22mm, y=107mm
    drawTextTopLeftMm(p2, asUpper(d.rue), 22, 107, { font: boldFont, size: 8, maxWidth: 180, singleLine: true });
    
    // Lot n° : x=22mm, y=113mm | Ilot : x=75mm
    drawTextTopLeftMm(p2, d.lot, 22, 113, { font: boldFont, size: 9 });
    drawTextTopLeftMm(p2, d.ilot, 75, 113, { font: boldFont, size: 9 });
    
    // Nom immeuble : x=42mm, y=119mm | Numéro étage : x=105mm | Numéro porte : x=155mm
    drawTextTopLeftMm(p2, asUpper(d.nomImmeuble), 42, 119, { font: boldFont, size: 8, maxWidth: 55, singleLine: true });
    drawTextTopLeftMm(p2, d.numeroEtage, 105, 119, { font: boldFont, size: 9 });
    drawTextTopLeftMm(p2, d.numeroPorte, 155, 119, { font: boldFont, size: 9 });
    
    // Section : x=28mm, y=125mm | Parcelle : x=95mm
    drawTextTopLeftMm(p2, d.section, 28, 125, { font: boldFont, size: 9 });
    drawTextTopLeftMm(p2, d.parcelle, 95, 125, { font: boldFont, size: 9 });
    
    // TF n° : x=25mm, y=131mm
    drawTextTopLeftMm(p2, d.tfNumero, 25, 131, { font: boldFont, size: 9 });
    
    // Tél : x=22mm, y=137mm | Fax : x=95mm
    drawTextTopLeftMm(p2, d.telephone, 22, 137, { font: boldFont, size: 9 });
    drawTextTopLeftMm(p2, d.fax, 95, 137, { font: boldFont, size: 9 });
    
    // Adresse postale : x=45mm, y=143mm | Email : x=115mm
    drawTextTopLeftMm(p2, d.adressePostale, 45, 143, { font: boldFont, size: 8, maxWidth: 65, singleLine: true });
    drawTextTopLeftMm(p2, d.email, 115, 143, { font: boldFont, size: 8, maxWidth: 80, singleLine: true });

    // --- V- INFORMATIONS SUR LES DIRIGEANTS, ACTIONNAIRES ---
    // Tableau associés (colonnes 1, 2, 3) - commence vers y=187mm
    // Colonnes centrées: 1 (x~78mm) | 2 (x~130mm) | 3 (x~178mm)
    const assocTableY = 187;
    const assocRowH = 7;
    
    // Remplir les colonnes du tableau associés
    d.associates.forEach((assoc, idx) => {
      if (idx >= 3) return; // Max 3 colonnes
      const colX = 78 + (idx * 52); // Colonnes à 78mm, 130mm, 182mm
      
      // Nom et Prénoms
      drawTextTopLeftMm(p2, asUpper(assoc.nom), colX, assocTableY, { font: boldFont, size: 7, maxWidth: 48, singleLine: true });
      // Adresse
      drawTextTopLeftMm(p2, asUpper(assoc.adresse), colX, assocTableY + assocRowH, { font, size: 6, maxWidth: 48, singleLine: true });
      // Nationalité
      drawTextTopLeftMm(p2, assoc.nationalite, colX, assocTableY + (assocRowH * 2), { font, size: 7, maxWidth: 48, singleLine: true });
      // Date et lieu naissance
      drawTextTopLeftMm(p2, `${assoc.dateNaissance} ${assoc.lieuNaissance}`, colX, assocTableY + (assocRowH * 3), { font, size: 6, maxWidth: 48, singleLine: true });
      // Régime matrimonial
      drawTextTopLeftMm(p2, assoc.regimeMatrimonial, colX, assocTableY + (assocRowH * 4), { font, size: 7, maxWidth: 48, singleLine: true });
      // Clauses opposables aux tiers (vide généralement) - row 5
      // Domicile - row 6
      drawTextTopLeftMm(p2, assoc.villeResidence || assoc.adresse, colX, assocTableY + (assocRowH * 6), { font, size: 6, maxWidth: 48, singleLine: true });
    });
  }

  // ============================================================
  // PAGE 3: Dirigeants sociaux + Commissaires + Signature
  // ============================================================
  if (pages[2]) {
    const p3 = pages[2];

    // --- Dirigeants sociaux (tableau en haut) ---
    // Colonnes centrées: 1 (x~78mm) | 2 (x~130mm) | 3 (x~178mm)
    const dirigTableY = 27;
    const dirigRowH = 8;
    
    // Colonne 1: Gérant principal
    // Nom et Prénoms
    drawTextTopLeftMm(p3, asUpper(d.gerantNom), 78, dirigTableY, { font: boldFont, size: 7, maxWidth: 48, singleLine: true });
    // Nom de jeune fille (vide) - row 1
    // Date et lieu de naissance - row 2
    drawTextTopLeftMm(p3, `le ${d.gerantDateNaissance} à ${d.gerantLieuNaissance}`, 78, dirigTableY + (dirigRowH * 2), { font, size: 6, maxWidth: 48, singleLine: true });
    // Fonction - row 3
    drawTextTopLeftMm(p3, 'GERANT', 78, dirigTableY + (dirigRowH * 3), { font: boldFont, size: 7, maxWidth: 48, singleLine: true });
    // Nationalité - row 4
    drawTextTopLeftMm(p3, d.gerantNationalite || 'Ivoirienne', 78, dirigTableY + (dirigRowH * 4), { font, size: 7, maxWidth: 48, singleLine: true });
    // Domicile - row 5
    drawTextTopLeftMm(p3, asUpper(d.gerantAdresse), 78, dirigTableY + (dirigRowH * 5), { font, size: 6, maxWidth: 48, singleLine: true });
    // Téléphone et adresse postale - row 6
    drawTextTopLeftMm(p3, d.telephone, 78, dirigTableY + (dirigRowH * 6), { font, size: 7, maxWidth: 48, singleLine: true });
    // Régime matrimonial adopté - row 7
    drawTextTopLeftMm(p3, d.gerantRegimeMatrimonial, 78, dirigTableY + (dirigRowH * 7), { font, size: 7, maxWidth: 48, singleLine: true });

    // --- Commissaires aux comptes (pour les SA obligatoires) ---
    // Ce tableau est généralement vide pour les SARL

    // --- Date et signature (en bas) ---
    // "Fait à Abidjan, le" - position vers x=130mm, y=197mm
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    drawTextTopLeftMm(p3, dateStr, 145, 197, { font: boldFont, size: 10 });
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
