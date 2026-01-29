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
  
  // Utiliser le même template pour les deux types (formulaire unique officiel)
  // Le template SARL PLURIPERSONEL n'existe pas encore en PDF
  const candidates = [
    path.join(modelsDir, 'SARL PLURIPERSONEL', 'formulaire-unique.pdf'),
    path.join(modelsDir, 'SARL UNIPERSONNELLE', 'formulaire-unique.pdf')
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      console.log(`   📄 Template trouvé: ${p}`);
      return p;
    }
  }

  throw new Error(`Gabarit CEPICI introuvable. Candidats testés: ${candidates.join(', ')}`);
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
  // PAGE 1: Déclarant + Projections d'investissement
  // Basé sur Formulaire_Unique-images-0.jpg
  // ============================================================
  const p1 = pages[0];
  
  // --- DÉCLARANT RESPONSABLE POUR L'ACCOMPLISSEMENT DES FORMALITÉS ---
  // Cette section commence vers y=163mm depuis le haut de la page
  // "DECLARATION ETABLIE PAR :" label finit vers x=54mm, valeur après pointillés
  drawTextTopLeftMm(p1, asUpper(d.declarantNom), 55, 166, { font: boldFont, size: 9, maxWidth: 145, singleLine: true });
  
  // "AGISSANT EN QUALITE DE :" label finit vers x=48mm
  drawTextTopLeftMm(p1, asUpper(d.declarantQualite), 49, 172, { font: boldFont, size: 9, maxWidth: 150, singleLine: true });
  
  // "NUMERO DE COMPTE CONTRIBUABLE" label finit vers x=68mm
  drawTextTopLeftMm(p1, asText(d.declarantNumCC), 69, 178, { font: boldFont, size: 9, maxWidth: 130, singleLine: true });
  
  // "ADRESSE PERSONNELLE" label finit vers x=48mm
  drawTextTopLeftMm(p1, asUpper(d.declarantAdresse), 49, 184, { font: boldFont, size: 8, maxWidth: 150, singleLine: true });
  
  // Ligne vide (2ème ligne adresse si nécessaire) - y=190mm
  
  // "TEL :" x=13mm, valeur après | "FAX :" valeur vers x=105mm (y=196mm)
  drawTextTopLeftMm(p1, asText(d.declarantTel), 20, 196, { font: boldFont, size: 9, singleLine: true });
  drawTextTopLeftMm(p1, asText(d.declarantFax), 110, 196, { font: boldFont, size: 9, singleLine: true });
  
  // "MOBILE :" x=13mm, valeur après | "E-MAIL :" valeur vers x=105mm (y=202mm)
  drawTextTopLeftMm(p1, asText(d.declarantMobile), 28, 202, { font: boldFont, size: 9, singleLine: true });
  drawTextTopLeftMm(p1, asText(d.declarantEmail), 110, 202, { font: boldFont, size: 8, maxWidth: 90, singleLine: true });

  // --- Tableau projections (en bas de page 1) ---
  // Titre "I- IDENTIFICATION" suivi du tableau avec colonnes ANNEE 1, ANNEE 2, ANNEE 3
  // Les colonnes sont centrées vers: ANNEE 1 (x=93mm), ANNEE 2 (x=130mm), ANNEE 3 (x=168mm)
  // "Montant d'Investissement (projeté)" - ligne y=233mm
  drawTextTopLeftMm(p1, d.investAnnee1, 93, 233, { font: boldFont, size: 9 });
  drawTextTopLeftMm(p1, d.investAnnee2, 130, 233, { font: boldFont, size: 9 });
  drawTextTopLeftMm(p1, d.investAnnee3, 168, 233, { font: boldFont, size: 9 });
  
  // "Nombre d'Emplois (projetés)" - ligne y=245mm
  drawTextTopLeftMm(p1, d.emploisAnnee1, 93, 245, { font: boldFont, size: 9 });
  drawTextTopLeftMm(p1, d.emploisAnnee2, 130, 245, { font: boldFont, size: 9 });
  drawTextTopLeftMm(p1, d.emploisAnnee3, 168, 245, { font: boldFont, size: 9 });

  // ============================================================
  // PAGE 2: I- Identification + II- Activité + III- Localisation + V- Associés
  // Basé sur Formulaire_Unique-images-1.jpg
  // ============================================================
  if (pages[1]) {
    const p2 = pages[1];
    
    // --- I- IDENTIFICATION (titre vers y=8mm) ---
    // "Dénomination sociale :" label finit vers x=43mm, valeur après (y=13mm)
    drawTextTopLeftMm(p2, `${asUpper(d.companyName)} SARL`, 44, 13, { font: boldFont, size: 9, maxWidth: 155, singleLine: true });
    
    // "Nom commercial :" label finit vers x=37mm (y=19mm)
    drawTextTopLeftMm(p2, asUpper(d.companyName), 38, 19, { font: boldFont, size: 9, maxWidth: 160, singleLine: true });
    
    // "Sigle :" label finit vers x=15mm (y=25mm)
    drawTextTopLeftMm(p2, asUpper(d.sigle), 16, 25, { font: boldFont, size: 9, maxWidth: 180, singleLine: true });
    
    // "Durée :" label finit vers x=18mm (y=31mm)
    drawTextTopLeftMm(p2, `${d.dureeSociete} ANS`, 19, 31, { font: boldFont, size: 9 });
    
    // "Forme juridique :" label finit vers x=37mm (y=37mm)
    drawTextTopLeftMm(p2, d.formeJuridique, 38, 37, { font: boldFont, size: 9 });
    
    // "Montant du capital :" x=42mm | "Dont : Montant en numéraire" x=115mm (y=43mm)
    drawTextTopLeftMm(p2, `${d.capital} FCFA`, 43, 43, { font: boldFont, size: 9 });
    drawTextTopLeftMm(p2, `${d.capitalNumeraire} FCFA`, 116, 43, { font: boldFont, size: 9 });
    
    // "Évaluation des apports en nature" - valeur vers x=68mm (y=49mm)
    drawTextTopLeftMm(p2, d.apportsNature || '0', 69, 49, { font: boldFont, size: 9 });

    // --- II- ACTIVITÉ (renseignements sur la personne morale) titre y=55mm ---
    // "Activité principale :" label finit vers x=38mm (y=61mm)
    drawTextTopLeftMm(p2, asText(d.activitePrincipale), 39, 61, { font: boldFont, size: 7, maxWidth: 160, singleLine: true });
    
    // "Activités secondaires :" label finit vers x=43mm (y=67mm)
    if (d.activitesSecondaires) {
      drawTextTopLeftMm(p2, asText(d.activitesSecondaires), 44, 67, { font, size: 7, maxWidth: 155, singleLine: true });
    }
    
    // "Chiffre d'affaires prévisionnel" label finit vers x=53mm (y=73mm)
    drawTextTopLeftMm(p2, d.chiffreAffairesPrev ? `${d.chiffreAffairesPrev} FCFA` : '', 54, 73, { font: boldFont, size: 9 });
    
    // "Nombre d'employés :" x=42mm | "Date embauche 1er employé :" x=125mm (y=79mm)
    drawTextTopLeftMm(p2, d.nombreEmployes, 43, 79, { font: boldFont, size: 9 });
    drawTextTopLeftMm(p2, d.dateEmbauchePremier, 126, 79, { font: boldFont, size: 9 });
    
    // "Date de début d'activité :" label finit vers x=48mm (y=85mm)
    drawTextTopLeftMm(p2, d.dateDebutActivite, 49, 85, { font: boldFont, size: 9 });

    // --- III- LOCALISATION DU SIEGE SOCIAL / DE LA SUCCURSALE (titre y=91mm) ---
    // "Ville :" x=15mm | "Commune :" x=68mm (y=97mm)
    drawTextTopLeftMm(p2, asUpper(d.ville), 16, 97, { font: boldFont, size: 9 });
    drawTextTopLeftMm(p2, asUpper(d.commune), 69, 97, { font: boldFont, size: 9, maxWidth: 60, singleLine: true });
    
    // "Quartier :" x=25mm | "Rue :" x=95mm (y=103mm)
    drawTextTopLeftMm(p2, asUpper(d.quartier), 26, 103, { font: boldFont, size: 8, maxWidth: 60, singleLine: true });
    drawTextTopLeftMm(p2, asUpper(d.rue), 96, 103, { font: boldFont, size: 8, maxWidth: 100, singleLine: true });
    
    // "Lot n°:" x=22mm | "Ilot :" x=82mm (y=109mm)
    drawTextTopLeftMm(p2, d.lot, 23, 109, { font: boldFont, size: 9 });
    drawTextTopLeftMm(p2, d.ilot, 83, 109, { font: boldFont, size: 9 });
    
    // "Nom immeuble :" x=38mm | "Numéro étage :" x=100mm | "Numéro porte :" x=155mm (y=115mm)
    drawTextTopLeftMm(p2, asUpper(d.nomImmeuble), 39, 115, { font: boldFont, size: 8, maxWidth: 55, singleLine: true });
    drawTextTopLeftMm(p2, d.numeroEtage, 101, 115, { font: boldFont, size: 9 });
    drawTextTopLeftMm(p2, d.numeroPorte, 156, 115, { font: boldFont, size: 9 });
    
    // "Section:" x=25mm | "Parcelle :" x=95mm (y=121mm)
    drawTextTopLeftMm(p2, d.section, 26, 121, { font: boldFont, size: 9 });
    drawTextTopLeftMm(p2, d.parcelle, 96, 121, { font: boldFont, size: 9 });
    
    // "TF n° :" x=18mm (y=127mm)
    drawTextTopLeftMm(p2, d.tfNumero, 19, 127, { font: boldFont, size: 9 });
    
    // "Tél. :" x=15mm | "Fax :" x=95mm (y=133mm)
    drawTextTopLeftMm(p2, d.telephone, 16, 133, { font: boldFont, size: 9 });
    drawTextTopLeftMm(p2, d.fax, 96, 133, { font: boldFont, size: 9 });
    
    // "Adresse postale :" x=40mm | "Email :" x=115mm (y=139mm)
    drawTextTopLeftMm(p2, d.adressePostale, 41, 139, { font: boldFont, size: 8, maxWidth: 70, singleLine: true });
    drawTextTopLeftMm(p2, d.email, 116, 139, { font: boldFont, size: 8, maxWidth: 80, singleLine: true });

    // --- IV- ADRESSE DES AUTRES ETABLISSEMENTS (titre y=145mm) ---
    // Généralement vide pour nouvelles créations

    // --- V- INFORMATIONS SUR LES DIRIGEANTS, ACTIONNAIRES ET COMMISSAIRES AUX COMPTES ---
    // Titre vers y=165mm, sous-titre "Associés tenus..." vers y=171mm
    // Tableau avec colonnes: label (x=13-68mm) | 1 (x=75mm) | 2 (x=120mm) | 3 (x=165mm)
    // Première ligne "Nom et Prénoms" vers y=185mm
    const assocTableY = 185;
    const assocRowH = 7;
    
    d.associates.forEach((assoc, idx) => {
      if (idx >= 3) return;
      const colX = 75 + (idx * 45); // 75mm, 120mm, 165mm
      
      // Nom et Prénoms
      drawTextTopLeftMm(p2, asUpper(assoc.nom), colX, assocTableY, { font: boldFont, size: 7, maxWidth: 42, singleLine: true });
      // Adresse
      drawTextTopLeftMm(p2, asUpper(assoc.adresse), colX, assocTableY + assocRowH, { font, size: 6, maxWidth: 42, singleLine: true });
      // Nationalité
      drawTextTopLeftMm(p2, assoc.nationalite, colX, assocTableY + (assocRowH * 2), { font, size: 7, maxWidth: 42, singleLine: true });
      // Date et lieu de naissance
      drawTextTopLeftMm(p2, `${assoc.dateNaissance} ${assoc.lieuNaissance}`, colX, assocTableY + (assocRowH * 3), { font, size: 6, maxWidth: 42, singleLine: true });
      // Régime matrimonial adopté
      drawTextTopLeftMm(p2, assoc.regimeMatrimonial, colX, assocTableY + (assocRowH * 4), { font, size: 7, maxWidth: 42, singleLine: true });
      // Clauses opposables aux tiers (row 5 - généralement vide)
      // Domicile
      drawTextTopLeftMm(p2, assoc.villeResidence || assoc.adresse, colX, assocTableY + (assocRowH * 6), { font, size: 6, maxWidth: 42, singleLine: true });
    });
  }

  // ============================================================
  // PAGE 3: Dirigeants sociaux + Commissaires aux comptes + Signature
  // Basé sur Formulaire_Unique-images-2.jpg
  // ============================================================
  if (pages[2]) {
    const p3 = pages[2];

    // --- Dirigeants sociaux (gérants, administrateurs...) ---
    // Titre vers y=12mm
    // Tableau avec colonnes: label (x=13-68mm) | 1 (x=75mm) | 2 (x=120mm) | 3 (x=165mm)
    // "Nom et Prénoms" vers y=24mm
    const dirigTableY = 24;
    const dirigRowH = 9;
    
    // Colonne 1: Gérant principal
    // Nom et Prénoms
    drawTextTopLeftMm(p3, asUpper(d.gerantNom), 75, dirigTableY, { font: boldFont, size: 7, maxWidth: 42, singleLine: true });
    // Nom de jeune fille (vide)
    // Date et lieu de naissance
    drawTextTopLeftMm(p3, `le ${d.gerantDateNaissance} à ${d.gerantLieuNaissance}`, 75, dirigTableY + (dirigRowH * 2), { font, size: 6, maxWidth: 42, singleLine: true });
    // Fonction
    drawTextTopLeftMm(p3, 'GERANT', 75, dirigTableY + (dirigRowH * 3), { font: boldFont, size: 7 });
    // Domicile
    drawTextTopLeftMm(p3, asUpper(d.gerantAdresse), 75, dirigTableY + (dirigRowH * 4), { font, size: 6, maxWidth: 42, singleLine: true });
    // Téléphone et adresse postale
    drawTextTopLeftMm(p3, d.telephone, 75, dirigTableY + (dirigRowH * 5), { font, size: 7, maxWidth: 42, singleLine: true });
    // Situation matrimoniale
    drawTextTopLeftMm(p3, d.gerantRegimeMatrimonial, 75, dirigTableY + (dirigRowH * 6), { font, size: 7, maxWidth: 42, singleLine: true });

    // --- Commissaires aux comptes (pour les SA obligatoires) ---
    // Ce tableau est généralement vide pour les SARL

    // --- Date et signature (en bas de page) ---
    // "Fait à Abidjan, le" vers x=40mm, y=200mm
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    drawTextTopLeftMm(p3, dateStr, 41, 200, { font: boldFont, size: 10 });
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
