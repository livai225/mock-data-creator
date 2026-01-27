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
  const candidates = [
    path.resolve(process.cwd(), 'models_ecriture'),
    path.resolve(process.cwd(), '..', 'models_ecriture'),
    path.resolve(process.cwd(), '..', '..', 'models_ecriture')
  ];

  for (const p of candidates) {
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return p;
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

const asUpper = (v) => (v == null ? '' : String(v)).trim().toUpperCase();
const asText = (v) => (v == null ? '' : String(v)).trim();

/**
 * Dessine du texte à une position (mm depuis haut-gauche).
 * Gère le retour à la ligne si maxWidth est fourni.
 */
const drawTextTopLeftMm = (page, text, leftMm, topMm, opts = {}) => {
  const value = asText(text);
  if (!value) return;

  const { size = 9, font, maxWidth, color = rgb(0, 0, 0) } = opts;
  const x = mmToPt(leftMm);
  const y = page.getHeight() - mmToPt(topMm);

  if (!maxWidth) {
    page.drawText(value, { x, y, size, font, color });
    return;
  }

  const maxWidthPt = mmToPt(maxWidth);
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
  
  const templatePath = getCepiciTemplatePath(associates);
  console.log(`   📄 Gabarit: ${templatePath}`);
  
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pages = pdfDoc.getPages();
  if (!pages.length) throw new Error('Gabarit CEPICI invalide: aucune page');

  const d = normalizeCepiciData(company, managers, associates, additionalData);
  console.log('   📋 Données normalisées:', JSON.stringify(d, null, 2));

  // ============================================================
  // PAGE 1: Déclarant + Projections (I- IDENTIFICATION)
  // ============================================================
  const p1 = pages[0];
  
  // --- DÉCLARANT RESPONSABLE ---
  // "DÉCLARATION ÉTABLIE PAR :" → après les deux-points
  drawTextTopLeftMm(p1, `M. ${asUpper(d.declarantNom)}`, 62, 83, { font: boldFont, size: 8, maxWidth: 120 });
  
  // "AGISSANT EN QUALITÉ DE :" 
  drawTextTopLeftMm(p1, asUpper(d.declarantQualite), 58, 88, { font: boldFont, size: 8, maxWidth: 120 });
  
  // "NUMÉRO DE COMPTE CONTRIBUABLE :"
  drawTextTopLeftMm(p1, asText(d.declarantNumCC), 72, 93, { font: boldFont, size: 8, maxWidth: 100 });
  
  // "ADRESSE PERSONNELLE :"
  drawTextTopLeftMm(p1, asUpper(d.declarantAdresse), 55, 98, { font: boldFont, size: 7, maxWidth: 140 });
  
  // "TEL :" / "FAX :" / "MOBILE :"
  drawTextTopLeftMm(p1, asText(d.declarantTel), 22, 105, { font: boldFont, size: 8 });
  drawTextTopLeftMm(p1, asText(d.declarantFax), 62, 105, { font: boldFont, size: 8 });
  drawTextTopLeftMm(p1, asText(d.declarantMobile), 105, 105, { font: boldFont, size: 8 });
  
  // "E-MAIL :"
  drawTextTopLeftMm(p1, asText(d.declarantEmail), 28, 110, { font: boldFont, size: 8, maxWidth: 160 });

  // --- I- IDENTIFICATION (tableau projections) ---
  // Ligne "Montant d'Investissement" : ANNÉE 1 | ANNÉE 2 | ANNÉE 3
  drawTextTopLeftMm(p1, d.investAnnee1, 82, 136, { font, size: 8 });
  drawTextTopLeftMm(p1, d.investAnnee2, 115, 136, { font, size: 8 });
  drawTextTopLeftMm(p1, d.investAnnee3, 150, 136, { font, size: 8 });
  
  // Ligne "Nombre d'Emplois"
  drawTextTopLeftMm(p1, d.emploisAnnee1, 82, 145, { font, size: 8 });
  drawTextTopLeftMm(p1, d.emploisAnnee2, 115, 145, { font, size: 8 });
  drawTextTopLeftMm(p1, d.emploisAnnee3, 150, 145, { font, size: 8 });

  // ============================================================
  // PAGE 2: Identification société + Activité + Localisation
  // ============================================================
  if (pages[1]) {
    const p2 = pages[1];
    
    // --- Dénomination sociale ---
    drawTextTopLeftMm(p2, `${asUpper(d.companyName)} SARL`, 55, 19, { font: boldFont, size: 8, maxWidth: 130 });
    
    // --- Nom commercial ---
    // (souvent vide ou identique)
    
    // --- Sigle ---
    drawTextTopLeftMm(p2, asUpper(d.sigle), 22, 28, { font: boldFont, size: 8, maxWidth: 60 });
    
    // --- Durée ---
    drawTextTopLeftMm(p2, `${d.dureeSociete} ANS`, 22, 33, { font: boldFont, size: 8 });
    
    // --- Forme juridique ---
    drawTextTopLeftMm(p2, d.formeJuridique, 42, 38, { font: boldFont, size: 8 });
    
    // --- Montant du capital ---
    drawTextTopLeftMm(p2, `${d.capital} FCFA`, 45, 43, { font: boldFont, size: 8 });
    
    // --- Dont : Montant en numéraire ---
    drawTextTopLeftMm(p2, d.capitalNumeraire, 135, 43, { font: boldFont, size: 8 });
    
    // --- Évaluation des apports en nature ---
    drawTextTopLeftMm(p2, d.apportsNature, 70, 48, { font: boldFont, size: 8 });

    // --- II- ACTIVITÉ ---
    // Activité principale
    drawTextTopLeftMm(p2, asText(d.activitePrincipale), 42, 58, { font: boldFont, size: 7, maxWidth: 155 });
    
    // Activités secondaires (ligne suivante si besoin)
    if (d.activitesSecondaires) {
      drawTextTopLeftMm(p2, asText(d.activitesSecondaires), 45, 68, { font, size: 7, maxWidth: 150 });
    }
    
    // Chiffre d'affaires prévisionnel
    drawTextTopLeftMm(p2, d.chiffreAffairesPrev ? `${d.chiffreAffairesPrev} FCFA` : '', 55, 78, { font: boldFont, size: 8 });
    
    // Nombre d'employés
    drawTextTopLeftMm(p2, d.nombreEmployes, 42, 83, { font: boldFont, size: 8 });
    
    // Date embauche 1er employé
    drawTextTopLeftMm(p2, d.dateEmbauchePremier, 115, 83, { font: boldFont, size: 8 });
    
    // Date de début d'activité
    drawTextTopLeftMm(p2, d.dateDebutActivite, 50, 88, { font: boldFont, size: 8 });

    // --- III- LOCALISATION DU SIÈGE SOCIAL ---
    // Ville / Commune / Quartier
    drawTextTopLeftMm(p2, asUpper(d.ville), 22, 100, { font: boldFont, size: 8 });
    drawTextTopLeftMm(p2, asUpper(d.commune), 62, 100, { font: boldFont, size: 8, maxWidth: 40 });
    drawTextTopLeftMm(p2, asUpper(d.quartier), 115, 100, { font: boldFont, size: 8, maxWidth: 60 });
    
    // Rue / Lot / Ilot
    drawTextTopLeftMm(p2, asUpper(d.rue), 22, 108, { font: boldFont, size: 7, maxWidth: 80 });
    drawTextTopLeftMm(p2, d.lot, 110, 108, { font: boldFont, size: 8 });
    drawTextTopLeftMm(p2, d.ilot, 145, 108, { font: boldFont, size: 8 });
    
    // Nom immeuble / Numéro étage / Numéro porte
    drawTextTopLeftMm(p2, asUpper(d.nomImmeuble), 38, 116, { font: boldFont, size: 7, maxWidth: 60 });
    drawTextTopLeftMm(p2, d.numeroEtage, 115, 116, { font: boldFont, size: 8 });
    drawTextTopLeftMm(p2, d.numeroPorte, 155, 116, { font: boldFont, size: 8 });
    
    // Section / Parcelle
    drawTextTopLeftMm(p2, d.section, 28, 124, { font: boldFont, size: 8 });
    drawTextTopLeftMm(p2, d.parcelle, 65, 124, { font: boldFont, size: 8 });
    
    // TF n° / Tél
    drawTextTopLeftMm(p2, d.tfNumero, 25, 132, { font: boldFont, size: 8 });
    drawTextTopLeftMm(p2, d.telephone, 85, 132, { font: boldFont, size: 8 });
    
    // Fax
    drawTextTopLeftMm(p2, d.fax, 22, 140, { font: boldFont, size: 8 });
    
    // Adresse postale / Email
    drawTextTopLeftMm(p2, d.adressePostale, 45, 148, { font: boldFont, size: 7, maxWidth: 70 });
    drawTextTopLeftMm(p2, d.email, 130, 148, { font: boldFont, size: 7, maxWidth: 60 });

    // --- IV- ADRESSE DES AUTRES ÉTABLISSEMENTS ---
    // (généralement vide ou "Néant")
  }

  // ============================================================
  // PAGE 3: V- INFORMATIONS SUR LES DIRIGEANTS, ACTIONNAIRES
  // ============================================================
  if (pages[2]) {
    const p3 = pages[2];

    // --- Tableau associés (en haut de page 3) ---
    // Colonnes: 1 | Nom et Prénoms | Adresse | Nationalité
    // On remplit ligne par ligne (max ~3-4 lignes visibles dans le tableau)
    const tableStartY = 52; // mm depuis le haut
    const rowHeight = 8; // mm entre chaque ligne
    
    d.associates.forEach((assoc, idx) => {
      if (idx >= 4) return; // Limiter à 4 lignes dans le tableau
      const y = tableStartY + (idx * rowHeight);
      
      // Colonne 1: numéro
      drawTextTopLeftMm(p3, String(idx + 1), 15, y, { font, size: 7 });
      
      // Colonne 2: Nom et Prénoms
      drawTextTopLeftMm(p3, asUpper(assoc.nom), 25, y, { font: boldFont, size: 7, maxWidth: 55 });
      
      // Colonne 3: Adresse
      drawTextTopLeftMm(p3, asUpper(assoc.adresse), 82, y, { font, size: 6, maxWidth: 45 });
      
      // Colonne 4: Nationalité
      drawTextTopLeftMm(p3, asText(assoc.nationalite), 130, y, { font, size: 7, maxWidth: 30 });
    });

    // --- Suite tableau: Date et lieu naissance / Régime matrimonial / Nom père / Nom mère ---
    // Ces colonnes sont sur les lignes suivantes du même tableau
    d.associates.forEach((assoc, idx) => {
      if (idx >= 4) return;
      const y = tableStartY + (idx * rowHeight);
      
      // Colonne 5: Date et lieu de naissance
      const dateEtLieu = `${assoc.dateNaissance}${assoc.lieuNaissance ? ' ' + assoc.lieuNaissance : ''}`;
      drawTextTopLeftMm(p3, dateEtLieu, 162, y, { font, size: 6, maxWidth: 35 });
    });

    // --- Dirigeants sociaux (gérant, administrateur...) ---
    // Section en bas de page 3
    const dirigeantStartY = 115; // mm depuis le haut (ajuster selon le PDF)
    
    // Ligne 1 du tableau dirigeants: Nom et Prénoms
    drawTextTopLeftMm(p3, asUpper(d.gerantNom), 25, dirigeantStartY, { font: boldFont, size: 7, maxWidth: 55 });
    
    // Adresse
    drawTextTopLeftMm(p3, asUpper(d.gerantAdresse), 82, dirigeantStartY, { font, size: 6, maxWidth: 45 });
    
    // Nationalité
    drawTextTopLeftMm(p3, asText(d.gerantNationalite), 130, dirigeantStartY, { font, size: 7, maxWidth: 30 });
    
    // Date et lieu de naissance
    const gerantDateLieu = `${d.gerantDateNaissance}${d.gerantLieuNaissance ? ', ' + asUpper(d.gerantLieuNaissance) : ''}`;
    drawTextTopLeftMm(p3, gerantDateLieu, 162, dirigeantStartY, { font, size: 6, maxWidth: 35 });

    // Ligne 2 du tableau dirigeants (suite infos)
    const dirigeantLigne2Y = dirigeantStartY + rowHeight;
    
    // Régime matrimonial
    drawTextTopLeftMm(p3, d.gerantRegimeMatrimonial, 25, dirigeantLigne2Y, { font, size: 7, maxWidth: 40 });
    
    // Nom du père
    drawTextTopLeftMm(p3, d.gerantPereNom, 70, dirigeantLigne2Y, { font, size: 7, maxWidth: 40 });
    
    // Nom de la mère
    drawTextTopLeftMm(p3, d.gerantMereNom, 115, dirigeantLigne2Y, { font, size: 7, maxWidth: 40 });
    
    // Domicile
    drawTextTopLeftMm(p3, asUpper(d.gerantVilleResidence || d.gerantAdresse), 160, dirigeantLigne2Y, { font, size: 6, maxWidth: 35 });
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
