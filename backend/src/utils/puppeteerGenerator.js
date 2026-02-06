/**
 * Générateur de PDF avec Puppeteer
 * Solution professionnelle et robuste pour la génération de documents PDF
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { generateCepiciHtml } from './cepiciHtmlGenerator.js';
import { generateStatutsSARL, generateContratBail, generateDSV, generateListeGerants, generateDeclarationHonneur } from './documentTemplates.js';

// Instance du navigateur (réutilisée pour de meilleures performances)
let browserInstance = null;

const readImageAsDataUri = (fileName) => {
  try {
    const imagePath = path.resolve(process.cwd(), 'public', 'images', fileName);
    if (!fs.existsSync(imagePath)) return '';

    const ext = path.extname(fileName).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : '';
    if (!mimeType) return '';

    const base64 = fs.readFileSync(imagePath).toString('base64');
    return `data:${mimeType};base64,${base64}`;
  } catch {
    return '';
  }
};

/**
 * Obtenir ou créer une instance de navigateur
 */
const getBrowser = async () => {
  if (!browserInstance) {
    console.log('🚀 Lancement de Puppeteer...');
    browserInstance = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    console.log('✅ Puppeteer lancé avec succès');
  }
  return browserInstance;
};

/**
 * Fermer l'instance du navigateur
 */
const closeBrowser = async () => {
  if (browserInstance) {
    console.log('🔒 Fermeture de Puppeteer...');
    await browserInstance.close();
    browserInstance = null;
    console.log('✅ Puppeteer fermé');
  }
};

/**
 * Styles CSS communs pour tous les documents
 */
const getCommonStyles = () => `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  @page {
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
  }
  
  body {
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #000;
    background: white;
  }
  
  .document {
    max-width: 100%;
  }
  
  /* Page de garde - Encadré OHADA */
  .cover-box {
    border: 2px solid #000;
    padding: 15px 20px;
    margin: 30px auto;
    max-width: 90%;
    text-align: center;
    font-size: 10pt;
  }
  
  .cover-box p {
    margin: 8px 0;
  }
  
  .cover-box .title {
    font-weight: bold;
    text-decoration: underline;
    margin: 15px 0;
  }
  
  .nb-section {
    text-align: left;
    margin: 30px 0;
    font-size: 10pt;
  }
  
  .nb-section .nb-title {
    text-decoration: underline;
    margin-bottom: 10px;
  }
  
  .nb-section ol {
    margin-left: 20px;
  }
  
  .nb-section li {
    margin-bottom: 8px;
  }
  
  .type-societe {
    text-align: center;
    margin: 60px 0 40px 0;
    font-size: 14pt;
    font-weight: bold;
  }
  
  .page-number {
    text-align: right;
    font-size: 10pt;
    margin-top: 50px;
  }
  
  /* Page 2 - Titre principal */
  .main-header {
    border: 3px solid #000;
    padding: 15px;
    margin-bottom: 30px;
    text-align: center;
  }
  
  .main-header h1 {
    font-size: 14pt;
    font-weight: bold;
    text-decoration: underline;
    margin-bottom: 10px;
  }
  
  .main-header .company-name {
    font-size: 16pt;
    font-weight: bold;
    margin: 10px 0;
  }
  
  .main-header .capital-info {
    font-size: 11pt;
    margin-top: 10px;
  }
  
  .date-section {
    margin: 30px 0;
  }
  
  .associe-item {
    margin: 20px 0;
    text-align: justify;
  }
  
  .associe-number {
    font-weight: bold;
  }
  
  .header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #000;
  }
  
  .header h1 {
    font-size: 16pt;
    font-weight: bold;
    color: #000;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .header .subtitle {
    font-size: 10pt;
    color: #333;
  }
  
  .main-title {
    text-align: center;
    font-size: 18pt;
    font-weight: bold;
    margin: 30px 0 20px 0;
    color: #000;
    text-transform: uppercase;
  }
  
  .company-name-simple {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    margin: 15px 0;
  }
  
  .company-name-container {
    text-align: center;
    margin: 20px 0;
  }
  
  .section-title {
    font-size: 12pt;
    font-weight: bold;
    margin: 25px 0 10px 0;
    color: #000;
    text-decoration: underline;
  }
  
  .article-title {
    font-size: 11pt;
    font-weight: bold;
    margin: 20px 0 8px 0;
    color: #000;
    text-decoration: underline;
  }
  
  .article-content {
    text-align: justify;
    margin-bottom: 10px;
  }

  .title-section {
    font-size: 12pt;
    font-weight: bold;
    margin: 24px 0 10px 0;
    text-transform: uppercase;
  }

  .paragraph-spacer {
    height: 8px;
  }

  .article-list {
    margin: 6px 0 10px 18px;
  }

  .article-list li {
    margin-bottom: 6px;
  }
  
  .info-row {
    display: flex;
    margin: 8px 0;
  }
  
  .info-label {
    font-weight: bold;
    min-width: 200px;
    color: #000;
  }
  
  .info-value {
    flex: 1;
  }
  
  .signature-section {
    margin-top: 40px;
    page-break-inside: avoid;
  }

  .signature-table th,
  .signature-table td {
    border: 1px solid #000;
    padding: 10px;
    height: 40px;
  }

  .signature-table th {
    text-align: left;
    font-weight: bold;
  }
  
  .signature-row {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
  }
  
  .signature-box {
    text-align: center;
    width: 45%;
  }
  
  .signature-line {
    border-top: 1px solid #000;
    margin-top: 50px;
    padding-top: 5px;
  }
  
  .page-break {
    page-break-before: always;
  }
  
  .text-center {
    text-align: center;
  }
  
  .text-bold {
    font-weight: bold;
  }
  
  .text-underline {
    text-decoration: underline;
  }
  
  .mt-20 {
    margin-top: 20px;
  }
  
  .mt-40 {
    margin-top: 40px;
  }
  
  .mb-10 {
    margin-bottom: 10px;
  }
  
  .separator {
    border-top: 1px solid #000;
    margin: 15px 0;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  
  table th, table td {
    border: 1px solid #000;
    padding: 8px;
    text-align: left;
  }
  
  table th {
    background-color: #f0f0f0;
    font-weight: bold;
  }
  
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 9pt;
    color: #333;
    padding: 10px 0;
    border-top: 1px solid #000;
  }
`;

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
 * Convertir un nombre en lettres
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
 * Échapper les caractères HTML
 */
const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const buildHtmlFromTemplateText = (templateText) => {
  const lines = templateText.split('\n');
  const htmlParts = [];
  let listItems = [];
  const isAllCapsLine = (value) => /^[A-ZÀ-ÖØ-Ý0-9\s,'’.-]+$/.test(value);
  const boldLinePatterns = [
    /^N\.?B\b/i,
    /^APPORTS EN NUM[ÉE]RAIRES?/i,
    /^IDENTITE DES APPORTEURS/i,
    /^MONTANT APPORT EN NUM[ÉE]RAIRE/i,
    /^IDENTITE DES ASSOCIES/i,
    /^CONCURRENCE DES PARTS/i,
    /^TOTAL EGAL/i
  ];

  const flushList = () => {
    if (listItems.length === 0) return;
    htmlParts.push(
      `<ul class="article-list">\n${listItems.map(item => `<li>${escapeHtml(item)}</li>`).join('\n')}\n</ul>`
    );
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      htmlParts.push('<div class="paragraph-spacer"></div>');
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('• ')) {
      listItems.push(line.replace(/^[-•]\s*/, ''));
      continue;
    }

    flushList();

    if (/^TITRE\s+/i.test(line)) {
      htmlParts.push(`<h2 class="title-section">${escapeHtml(line)}</h2>`);
      continue;
    }

    if (/^ARTICLE/i.test(line)) {
      htmlParts.push(`<h3 class="article-title">${escapeHtml(line)}</h3>`);
      continue;
    }

    const isBoldLine = isAllCapsLine(line) || boldLinePatterns.some((pattern) => pattern.test(line));
    if (isBoldLine) {
      htmlParts.push(`<p class="article-content text-bold">${escapeHtml(line)}</p>`);
      continue;
    }

    htmlParts.push(`<p class="article-content">${escapeHtml(line)}</p>`);
  }

  flushList();
  return htmlParts.join('\n');
};

const buildStatutsArticlesFromTemplate = (company, associates, managers) => {
  const fullText = generateStatutsSARL(company, associates, managers);
  const marker = 'TITRE I : DISPOSITIONS GENERALES';
  const markerIndex = fullText.indexOf(marker);
  const articlesText = markerIndex >= 0 ? fullText.slice(markerIndex) : fullText;
  const articlesHtml = buildHtmlFromTemplateText(articlesText);
  return `${articlesHtml}\n${buildStatutsSignatureTable(company, associates, managers)}`;
};

const buildHtmlDocumentFromTemplateText = (templateText) => `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <style>${getCommonStyles()}</style>
  </head>
  <body>
    <div class="document">
      ${buildHtmlFromTemplateText(templateText)}
    </div>
  </body>
  </html>
`;

const buildStatutsSignatureTable = (company, associates, managers) => {
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';
  const rows = (associates && associates.length > 0)
    ? associates.map((a) => {
        const nom = a.name || `${a.nom || ''} ${a.prenoms || ''}`.trim() || '[NOM ASSOCIÉ]';
        return `<tr><td>M. ${escapeHtml(nom)}</td><td></td></tr>`;
      }).join('')
    : `<tr><td>M. ${escapeHtml(gerantNom)}</td><td></td></tr>`;

  return `
    <div class="signature-section">
      <table class="signature-table">
        <thead>
          <tr>
            <th>NOMS DES ASSOCIES</th>
            <th>SIGNATURES</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
};

/**
 * Template HTML: Statuts SARL - Format professionnel OHADA
 */
const generateStatutsHTML = (company, associates, managers) => {
  const capital = parseFloat(company.capital) || 0;
  const capitalWords = numberToWords(Math.floor(capital)).toUpperCase();
  const duree = company.duree_societe || 99;
  const dureeWords = numberToWords(duree);
  
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';
  const gerantProfession = gerant?.profession || '[PROFESSION]';
  const gerantAdresse = gerant?.adresse || gerant?.address || '[ADRESSE]';
  const gerantVilleResidence = gerant?.ville_residence || gerant?.villeResidence || company.city || 'ABIDJAN';
  const gerantNationalite = gerant?.nationalite || gerant?.nationality || '[NATIONALITÉ]';
  const gerantDateNaissance = (gerant?.date_naissance || gerant?.dateNaissance) ? formatDate(gerant.date_naissance || gerant.dateNaissance) : '[DATE NAISSANCE]';
  const gerantLieuNaissance = gerant?.lieu_naissance || gerant?.lieuNaissance || '[LIEU NAISSANCE]';
  const gerantTypeId = gerant?.type_identite || gerant?.typeIdentite || 'CNI';
  const gerantNumId = gerant?.numero_identite || gerant?.numeroIdentite || '[NUMÉRO]';
  const gerantDateDelivranceId = (gerant?.date_delivrance_id || gerant?.dateDelivranceId) ? formatDate(gerant.date_delivrance_id || gerant.dateDelivranceId) : '[DATE DÉLIVRANCE]';
  const gerantDateValiditeId = (gerant?.date_validite_id || gerant?.dateValiditeId) ? formatDate(gerant.date_validite_id || gerant.dateValiditeId) : '[DATE VALIDITÉ]';
  const gerantLieuDelivranceId = gerant?.lieu_delivrance_id || gerant?.lieuDelivranceId || 'la République de Côte d\'Ivoire';
  
  const isUnipersonnelle = !associates || associates.length <= 1;
  const nombreParts = associates?.reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0) || Math.floor(capital / 5000);
  const valeurPart = capital / nombreParts;
  
  const annee = new Date().getFullYear();
  const dateActuelle = formatDate(new Date().toISOString());
  
  // Construire l'objet social
  const objetSocial = company.activity || '[OBJET SOCIAL]';
  
  // Récupérer le nom de la banque
  const banque = company.banque || '[NOM DE LA BANQUE]';
  
  // Construire l'adresse complète
  const baseAdresse = `${(company.address || '[ADRESSE]').toUpperCase()}${company.commune ? ' COMMUNE DE ' + company.commune.toUpperCase() : ''}${company.quartier ? ', ' + company.quartier.toUpperCase() : ''}`;
  const cityUpper = (company.city || 'ABIDJAN').toUpperCase();
  const citySuffix = baseAdresse.includes(cityUpper) ? '' : `, ${cityUpper}`;
  const lotSuffix = company.lot && !baseAdresse.includes(`LOT ${company.lot}`) ? ` LOT ${company.lot}` : '';
  const ilotSuffix = company.ilot && !baseAdresse.includes(`ILOT ${company.ilot}`) ? `, ILOT ${company.ilot}` : '';
  const adresseComplete = `${baseAdresse}${citySuffix}${lotSuffix}${ilotSuffix}`;
  
  // Générer la liste des associés numérotée
  let associesListHTML = '';
  let associesTableRows = '';
  let totalApports = 0;
  let repartitionParts = '';
  let signaturesHTML = '';
  
  if (associates && associates.length > 0) {
    associates.forEach((associe, index) => {
      const parts = parseInt(associe.parts) || 0;
      const apport = (capital * parts) / nombreParts;
      totalApports += apport;
      
      // Récupérer les infos de l'associé
      const assocNom = associe.name || `[NOM ASSOCIÉ ${index + 1}]`;
      const assocProfession = associe.profession || '[PROFESSION]';
      const assocAdresse = associe.adresse || associe.address || gerantVilleResidence;
      const assocNationalite = associe.nationalite || associe.nationality || '[NATIONALITÉ]';
      const assocDateNaissance = associe.date_naissance || associe.dateNaissance ? formatDate(associe.date_naissance || associe.dateNaissance) : '[DATE]';
      const assocLieuNaissance = associe.lieu_naissance || associe.lieuNaissance || '[LIEU]';
      const assocTypeId = associe.type_identite || associe.typeIdentite || 'passeport';
      const assocNumId = associe.numero_identite || associe.numeroIdentite || '[N°]';
      const assocDateDelivrance = associe.date_delivrance_id || associe.dateDelivranceId ? formatDate(associe.date_delivrance_id || associe.dateDelivranceId) : '[DATE]';
      const assocDateValidite = associe.date_validite_id || associe.dateValiditeId ? formatDate(associe.date_validite_id || associe.dateValiditeId) : '[DATE]';
      const assocPays = associe.pays || associe.country || 'la République de Côte d\'Ivoire';
      
      // Liste numérotée des associés pour la page 2
      associesListHTML += `
        <div class="associe-item">
          <span class="associe-number">${index + 1}- M. ${escapeHtml(assocNom.toUpperCase())}</span>, ${escapeHtml(assocProfession)} résidant à ${escapeHtml(assocAdresse.toUpperCase())} de nationalité ${escapeHtml(assocNationalite)}, né le ${assocDateNaissance} à ${escapeHtml(assocLieuNaissance.toUpperCase())} et titulaire du ${assocTypeId} N°${escapeHtml(assocNumId)} délivrée le ${assocDateDelivrance} et valable jusqu'au ${assocDateValidite} par ${escapeHtml(assocPays)}.
        </div>
      `;
      
      // Tableau des apports
      associesTableRows += `
        <tr>
          <td>${escapeHtml(assocNom)}</td>
          <td>${parts} parts</td>
          <td>${apport.toLocaleString('fr-FR')} FCFA</td>
        </tr>
      `;
      
      // Répartition des parts
      const debutParts = index === 0 ? 1 : associates.slice(0, index).reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0) + 1;
      const finParts = associates.slice(0, index + 1).reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0);
      repartitionParts += `
        <tr><td>M. ${escapeHtml(assocNom)}</td><td>${parts} parts sociales numérotées de ${debutParts} à ${finParts}</td></tr>
      `;
      
      // Signatures
      signaturesHTML += `
        <div class="signature-box">
          <p>Associé ${index + 1}</p>
          <div class="signature-line">${escapeHtml(assocNom)}</div>
        </div>
      `;
    });
  } else {
    totalApports = capital;
    associesListHTML = `
      <div class="associe-item">
        <span class="associe-number">1- M. ${escapeHtml(gerantNom.toUpperCase())}</span>, ${escapeHtml(gerantProfession)} résidant à ${escapeHtml(gerantAdresse.toUpperCase())} de nationalité ${escapeHtml(gerantNationalite)}, né le ${gerantDateNaissance} à ${escapeHtml(gerantLieuNaissance.toUpperCase())} et titulaire de la ${gerantTypeId} N°${escapeHtml(gerantNumId)} délivrée le ${gerantDateDelivranceId} et valable jusqu'au ${gerantDateValiditeId} par ${escapeHtml(gerantLieuDelivranceId)}.
      </div>
    `;
    associesTableRows = `
      <tr>
        <td>${escapeHtml(gerantNom)}</td>
        <td>${nombreParts} parts</td>
        <td>${capital.toLocaleString('fr-FR')} FCFA</td>
      </tr>
    `;
    repartitionParts = `<tr><td>M. ${escapeHtml(gerantNom)}</td><td>${nombreParts} parts sociales numérotées de 1 à ${nombreParts}</td></tr>`;
    signaturesHTML = `
      <div class="signature-box">
        <p>L'Associé Unique</p>
        <div class="signature-line">${escapeHtml(gerantNom)}</div>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        ${getCommonStyles()}
        
        /* Styles spécifiques pour Statuts SARL - Format PDF modèle */
        .statuts-cover {
          border: 4px solid black;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 257mm;
          padding: 0;
          margin-bottom: 20mm;
          box-sizing: border-box;
        }
        .statuts-cover-content {
          text-align: center;
          font-family: Arial, sans-serif;
          font-weight: bold;
          color: black;
        }
        .statuts-cover-title {
          font-size: 18pt;
          margin-bottom: 40px;
          text-transform: uppercase;
        }
        .statuts-cover-company {
          font-size: 20pt;
          margin-bottom: 40px;
          text-transform: uppercase;
        }
        .statuts-cover-capital {
          font-size: 16pt;
          text-transform: uppercase;
        }
        .statuts-page2 {
          border: 4px solid black;
          min-height: 257mm;
          padding: 15mm;
          margin-bottom: 20mm;
          position: relative;
          box-sizing: border-box;
        }
        .statuts-page2-header {
          border: 2px double black;
          padding: 8mm;
          margin-bottom: 15mm;
          text-align: left;
        }
        .statuts-page2-header p {
          margin: 2mm 0;
          font-size: 11pt;
        }
        .statuts-page2-title {
          text-align: center;
          margin-bottom: 10mm;
        }
        .statuts-page2-title h1 {
          font-size: 14pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 8mm;
        }
        .statuts-page2-title p {
          font-size: 11pt;
          margin-bottom: 15mm;
        }
        .statuts-page2-nb {
          text-align: left;
          margin-bottom: 15mm;
        }
        .statuts-page2-nb-title {
          font-size: 11pt;
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 5mm;
        }
        .statuts-page2-nb p {
          font-size: 11pt;
          margin-bottom: 5mm;
          text-align: justify;
        }
        .statuts-page2-nb p:first-of-type {
          margin-bottom: 3mm;
        }
        .statuts-page2-footer {
          text-align: center;
          margin-top: 40mm;
        }
        .statuts-page2-footer p {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 2mm;
        }
        .statuts-page-number {
          position: absolute;
          bottom: 10mm;
          right: 15mm;
          font-size: 10pt;
        }
      </style>
    </head>
    <body>
      <div class="document">
        <!-- PAGE 1 : PAGE DE COUVERTURE -->
        <div class="statuts-cover">
          <div class="statuts-cover-content">
            <div class="statuts-cover-title">STATUTS DE LA SOCIETE</div>
            <div class="statuts-cover-company">«${escapeHtml((company.company_name || '[NOM SOCIÉTÉ]').toUpperCase())}${company.sigle ? ', en Abrégée ' + escapeHtml(company.sigle.toUpperCase()) : ''} SARL »</div>
            <div class="statuts-cover-capital">AU CAPITAL DE ${capital.toLocaleString('fr-FR').replace(/\s/g, '.')} FCFA</div>
          </div>
        </div>
        
        <!-- PAGE 2 : INFORMATIONS OHADA -->
        <div class="page-break"></div>
        
        <div class="statuts-page2">
          <!-- Header avec double bordure -->
          <div class="statuts-page2-header">
            <p>Modèle Type utilisable et adaptable, conforme aux dispositions en vigueur</p>
            <p>de l'Acte uniforme révisé de l'OHADA du 30 janvier 2014 relatif au</p>
            <p>Droit des Sociétés commerciales et du Groupement d'Intérêt Economique</p>
          </div>
          
          <!-- Titre centré -->
          <div class="statuts-page2-title">
            <h1>STATUT TYPE SOUS SEING PRIVE</h1>
            <p>Cas d'une Société à Responsabilité Limitée comportant ${isUnipersonnelle ? 'un associé unique' : 'plusieurs associés'} et constituée exclusivement par apports en numéraire</p>
          </div>
          
          <!-- Section N.B. -->
          <div class="statuts-page2-nb">
            <p class="statuts-page2-nb-title">N.B : Indications d'utilisation</p>
            <p>Ce cas de figure courant a été conçu pour faciliter et encadrer le processus de création d'entreprise pour une meilleure sécurisation des opérateurs économiques.</p>
            <p>1. les espaces en pointillé sont des champs à remplir et à adapter à partir des informations décrites dans les parenthèses qui suivent ;</p>
            <p>2. établir les statuts en nombre suffisant pour la remise d'un exemplaire original à chaque associé, le dépôt d'un exemplaire au siège social, et l'accomplissement des formalités de constitution.</p>
          </div>
          
          <!-- Bas de page -->
          <div class="statuts-page2-footer">
            <p>SARL ${isUnipersonnelle ? 'unipersonnelle' : 'pluripersonnelle'} constituée exclusivement</p>
            <p>Par apports en numéraire</p>
          </div>
          
          <!-- Numéro de page -->
          <div class="statuts-page-number">1</div>
        </div>
        
        <!-- PAGE 3 : STATUTS -->
        <div class="page-break"></div>
        
        <div class="main-header" style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 14pt; font-weight: bold;">STATUTS DE LA SOCIÉTÉ A RESPONSABILITÉ LIMITÉE DÉNOMMÉE</h1>
          <p style="font-size: 14pt; font-weight: bold; margin: 15px 0;">«${escapeHtml((company.company_name || '[NOM SOCIÉTÉ]').toUpperCase())}${company.sigle ? ' ' + company.sigle : ''} SARL»</p>
          <p style="font-size: 11pt;">Au capital de ${capital.toLocaleString('fr-FR')} FCFA, située à ${adresseComplete}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p>L'An Deux Mil ${numberToWords(annee % 100).charAt(0).toUpperCase() + numberToWords(annee % 100).slice(1)},</p>
          <p>Le ${dateActuelle}</p>
        </div>
        
        ${associesListHTML}
        
        <p class="mt-20">
          ${isUnipersonnelle ? 'A établi' : 'Ont établi'} ainsi qu'il suit les statuts de la société à responsabilité limitée devant exister entre ${isUnipersonnelle ? 'lui' : 'eux'}.
        </p>
        
        <!-- ARTICLES -->
        ${buildStatutsArticlesFromTemplate(company, associates, managers)}
      </div>
    </body>
    </html>
  `;
};

/**
 * Template HTML: Contrat de Bail Commercial
 */
const generateContratBailHTML = (company, additionalData = {}) => {
  const gerant = company.managers && company.managers.length > 0 ? company.managers[0] : null;
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';

  const bailData = additionalData.bailleurData || additionalData.bailleur_data || additionalData.contrat_bail || additionalData.contratBail || additionalData;
  const bailleurNom = (bailData.bailleur_nom || bailData.nom_bailleur || bailData.bailleurNom || '[NOM DU BAILLEUR]').trim();
  const bailleurTel = bailData.bailleur_telephone || bailData.bailleur_contact || bailData.telephone_bailleur || bailData.bailleurTelephone || '[TÉLÉPHONE]';

  const loyerMensuel = bailData.loyer_mensuel || bailData.loyerMensuel || bailData.montant_loyer || 0;
  const cautionMois = bailData.caution_mois || bailData.cautionMois || 2;
  const avanceMois = bailData.avance_mois || bailData.avanceMois || 2;
  const dureeBail = bailData.duree_bail || bailData.dureeBail || 1;
  const dateDebut = bailData.date_debut ? formatDate(bailData.date_debut) : formatDate(new Date().toISOString());
  const dateFin = bailData.date_fin ? formatDate(bailData.date_fin) : null;

  const lotNumero = bailData.lot || bailData.lotNumero || company.lot || '';
  const ilotNumero = bailData.ilot || bailData.ilotNumero || company.ilot || '';
  const communeText = company.commune ? ` COMMUNE DE ${company.commune.toUpperCase()}` : '';
  const quartierText = company.quartier ? ` ${company.quartier.toUpperCase()}` : '';
  const lotText = lotNumero ? ` LOT ${lotNumero}` : '';
  const ilotText = ilotNumero ? `, ILOT ${ilotNumero}` : '';
  const adresseComplete = `${(company.city || 'ABIDJAN').toUpperCase()}${communeText}${quartierText}, ${(company.address || '[ADRESSE]').toUpperCase()}${lotText}${ilotText}`;

  const dateActuelle = formatDate(new Date().toISOString());

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>${getCommonStyles()}</style>
    </head>
    <body>
      <div class="document">
        <p class="main-title">CONTRAT DE BAIL COMMERCIAL</p>
        <p>Entre les soussignés :</p>
        <p><strong>${escapeHtml(bailleurNom)}</strong>, Téléphone : ${escapeHtml(bailleurTel)} Propriétaire, ci-après dénommé « le bailleur »</p>
        <p>D’une part</p>
        <p>Et</p>
        <p>La société dénommée « ${escapeHtml(company.company_name || '[NOM SOCIÉTÉ]')} » Représenté par son gérant Monsieur ${escapeHtml(gerantNom)} locataire ci-après dénommé « le preneur »</p>
        <p>D’autre part.</p>
        <p>Il a été dit et convenu ce qui suit :</p>
        <p>Le bailleur loue et donne par les présentes au preneur, qui accepte, les locaux ci-après désignés sis à ${adresseComplete} en vue de l’exploitation de la «${escapeHtml(company.company_name || '[NOM SOCIÉTÉ]')}».</p>

        <p><strong>Article 1 : Désignation</strong></p>
        <p>Il est précisé que l’emplacement est livré nu, et que le preneur devra supporter le cout et les frais d’eaux, d’électricité, téléphone et en général, tous travaux d’aménagements.</p>
        <p>Tel au surplus que le cout se poursuit et se comporte sans plus ample description, le preneur déclarant avoir vu. Visite et parfaitement connaitre les locaux loués, qu’il consent à occuper dans leur état actuel</p>

        <p><strong>Article 2 : Durée</strong></p>
        <p>Le présent bail est conclu pour une durée d’un (01) an allant du ${dateDebut}${dateFin ? ` au ${dateFin}` : ''} à son expiration, le bail se renouvellera par tacite reconduction, sauf dénonciation par acte extra judiciaire, au plus tard TROIS (03) mois avant la date d’expiration de la période triennale concernée.</p>

        <p><strong>Article 3 : Renouvellement et cession</strong></p>
        <p>- Le preneur qui a droit au renouvellement de son bail, doit demander le renouvellement de celui-ci au bailleur, par écrit, au plus tard deux (2) mois avant la date d’expiration du bail.</p>
        <p>- Le preneur qui n’a pas formé sa demande de renouvellement dans ce délai est déchu du droit de renouvellement du bail.</p>
        <p>Le BAILLEUR qui n'a pas fait connaître sa réponse à la demande de renouvellement au plus tard UN (01) mois avant l'expiration du bail est réputé avoir accepté le principe du renouvellement de ce bail.</p>
        <p>La partie qui entend résilier le bail doit donner congés, par acte extra judiciaire au moins SIX (06) mois à l’avance.</p>

        <p><strong>Article 4 : Obligation du bailleur</strong></p>
        <p>- Le bailleur fait procéder, à ses frais dans les locaux donnés à bail, à toutes les grosses réparations devenues nécessaires et urgentes.</p>
        <p>Le bailleur délivre les locaux en bon état.</p>
        <p>- Le bailleur autorise le preneur à apposer sur les façades extérieures des locaux les enseignes et plaques indicatrices relatives à son commerce.</p>

        <p><strong>Article 5 : Obligation du preneur</strong></p>
        <p>- Le preneur doit payer le loyer aux termes convenus, entre les mains du bailleur.</p>
        <p>- Le preneur est tenu d’exploiter les locaux donnés à bail, en bon père de famille, et conformément à la destination prévue au bail, à défaut de convention écrite, suivant celle présumée d’après les circonstances.</p>
        <p>Le preneur est tenu des réparations d’entretien ; il répond des dégradations ou des pertes dues à un défaut d’entretien en cours de bail.</p>

        <p><strong>Article 6 : Loyer</strong></p>
        <p>La présente location est consentie et acceptée moyennant un loyer mensuel de ${numberToWords(Math.floor(loyerMensuel))} (${loyerMensuel.toLocaleString('fr-FR')}) francs CFA, payable à la fin du mois au plus tard le cinq (05) du mois suivant. De plus une garantie de ${numberToWords(Math.floor(loyerMensuel * (cautionMois + avanceMois))).toUpperCase()} (${(loyerMensuel * (cautionMois + avanceMois)).toLocaleString('fr-FR')} FCFA) dont ${cautionMois} mois de caution et ${avanceMois} mois d’avance.</p>
        <p>Les parties conviennent que le prix fixé ci-dessus ne peut être révisé au cours du bail.</p>
        <p>Dans le cas où il surviendrait une contestation sur le montant du loyer tel qu’il est défini par le présent bail, le preneur devra aviser le bailleur qui s’engage à s’en remettre à une expertise amiable.</p>

        <p><strong>Article 7 : Sous-location</strong></p>
        <p>Sauf stipulation contraire du bail, toute sous-location totale ou partielle est interdite.</p>

        <p><strong>Article 8 : Clause résolutoire.</strong></p>
        <p>A défaut de paiement d’un seul terme de loyer ou en cas d’inexécution d’une clause du bail, le bailleur pourra demander à la juridiction compétente la résiliation du bail et l’expulsion du preneur, et de tous occupants de son chef, après avoir fait délivrer, par acte extrajudiciaire, une mise en demeure d’avoir à respecter les clauses et conditions du bail.</p>

        <p><strong>Article 9 : Election de domicile</strong></p>
        <p>En cas de litige, si aucun accord amiable n’est trouvé, le tribunal d’Abidjan sera seul compétent.</p>

        <p>Fait en deux exemplaires et de bonne foi.</p>
        <p>A ${escapeHtml(company.city || 'Abidjan')}, le ${dateActuelle}</p>
        <p>Le Bailleur                              Le Preneur</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template HTML: Liste des Gérants
 */
const generateListeGerantsHTML = (company, managers, additionalData = {}) => {
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';
  const gerantProfession = gerant?.profession || '[PROFESSION]';
  const gerantAdresse = gerant?.adresse || gerant?.address || '[ADRESSE]';
  const gerantNationalite = gerant?.nationalite || gerant?.nationality || '[NATIONALITÉ]';
  const gerantDateNaissance = (gerant?.date_naissance || gerant?.dateNaissance) ? formatDate(gerant.date_naissance || gerant.dateNaissance) : '[DATE]';
  const gerantLieuNaissance = gerant?.lieu_naissance || gerant?.lieuNaissance || '[LIEU]';
  const gerantTypeId = gerant?.type_identite || gerant?.typeIdentite || 'CNI';
  const gerantNumId = gerant?.numero_identite || gerant?.numeroIdentite || '[NUMÉRO]';
  const gerantDateDelivranceId = (gerant?.date_delivrance_id || gerant?.dateDelivranceId) ? formatDate(gerant.date_delivrance_id || gerant.dateDelivranceId) : '[DATE]';
  const gerantDateValiditeId = (gerant?.date_validite_id || gerant?.dateValiditeId) ? formatDate(gerant.date_validite_id || gerant.dateValiditeId) : '[DATE]';
  const gerantLieuDelivranceId = gerant?.lieu_delivrance_id || gerant?.lieuDelivranceId || 'la République de Côte d\'Ivoire';

  const communeText = company.commune ? ` COMMUNE DE ${company.commune.toUpperCase()}` : '';
  const quartierText = company.quartier ? ` ${company.quartier.toUpperCase()}` : '';
  const lotText = company.lot ? ` LOT ${company.lot}` : '';
  const ilotText = company.ilot ? `, ILOT ${company.ilot}` : '';
  const adresseComplete = `${(company.city || 'ABIDJAN').toUpperCase()}${communeText}${quartierText}, ${(company.address || '[ADRESSE]').toUpperCase()}${lotText}${ilotText}`;

  const dureeMandat = gerant?.duree_mandat || gerant?.dureeMandat || 4;
  const dureeLine = (managers && managers.length > 1)
    ? `Est nommé Gérant pour une durée de ${numberToWords(dureeMandat)} ans (${dureeMandat} ans)`
    : `Est nommé gérant de la société pour une durée de ${numberToWords(dureeMandat)} ans (${dureeMandat}ans),`;

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        ${getCommonStyles()}

        /* Format calqué sur le modèle PDF (liste de dirigeant) */
        body {
          font-family: 'Comic Sans MS', 'Arial Rounded MT Bold', 'Arial Black', sans-serif;
          font-size: 12pt;
          line-height: 1.4;
          color: #000;
        }
        .liste-dirigeant {
          padding: 20mm 18mm;
        }
        .liste-title {
          text-align: center;
          font-size: 16pt;
          font-weight: 700;
          margin: 0 0 12mm 0;
        }
        .liste-address {
          text-align: center;
          font-weight: 700;
          text-transform: uppercase;
          margin: 0 0 6mm 0;
        }
        .liste-separator {
          border: none;
          border-top: 2px dashed #000;
          margin: 6mm 0 10mm 0;
        }
        .liste-heading {
          text-align: center;
          font-weight: 700;
          text-decoration: underline;
          margin: 0 0 6mm 0;
        }
        .liste-line {
          margin: 0 0 6mm 0;
        }
        .liste-signature {
          text-align: right;
          margin-top: 14mm;
          font-weight: 700;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="document liste-dirigeant">
        <div class="liste-title">«${escapeHtml((company.company_name || '[NOM SOCIÉTÉ]').toUpperCase())} SARL»</div>
        <div class="liste-address">Au capital de ${(company.capital || 0).toLocaleString('fr-FR')} FCFA, située à ${adresseComplete}</div>
        <hr class="liste-separator" />
        <div class="liste-heading">LISTE DE DIRIGEANT</div>
        <div class="liste-line">${dureeLine}</div>
        <div class="liste-line">M. ${escapeHtml(gerantNom)}, ${escapeHtml(gerantProfession)} résidant à ${escapeHtml(gerantAdresse)} de nationalité ${escapeHtml(gerantNationalite)}, né le ${gerantDateNaissance} à ${escapeHtml(gerantLieuNaissance)} et titulaire du ${escapeHtml(gerantTypeId)} N°${escapeHtml(gerantNumId)} délivrée le ${gerantDateDelivranceId} et valable jusqu’au ${gerantDateValiditeId} par ${escapeHtml(gerantLieuDelivranceId)}</div>
        <div class="liste-signature">Signature</div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template HTML: Déclaration sur l'Honneur
 */
const generateDeclarationHonneurHTML = (company, managers) => {
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  const gerantNom = gerant?.nom || '[NOM]';
  const gerantPrenoms = gerant?.prenoms || '[PRÉNOMS]';
  const gerantPereNom = gerant?.pere_nom || gerant?.pereNom || '[NOM DU PÈRE]';
  const gerantMereNom = gerant?.mere_nom || gerant?.mereNom || '[NOM DE LA MÈRE]';
  const gerantNationalite = gerant?.nationalite || gerant?.nationality || '[NATIONALITÉ]';
  const gerantDateNaissance = gerant?.date_naissance || gerant?.dateNaissance ? formatDate(gerant.date_naissance || gerant.dateNaissance) : '[DATE NAISSANCE]';
  const gerantDomicile = gerant?.ville_residence || gerant?.villeResidence || gerant?.adresse || gerant?.address || '[DOMICILE]';
  const dateActuelle = formatDate(new Date().toISOString());

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        ${getCommonStyles()}

        .decl-wrapper {
          padding: 18mm 20mm;
          font-family: 'Times New Roman', Georgia, serif;
          font-size: 12pt;
          color: #000;
        }
        .decl-title {
          text-align: center;
          font-weight: bold;
          text-decoration: underline;
          margin: 0 0 6mm 0;
        }
        .decl-subtitle {
          text-align: center;
          font-size: 10.5pt;
          margin: 0 0 8mm 0;
        }
        .decl-field {
          margin: 2.5mm 0;
        }
        .decl-field strong {
          font-weight: bold;
        }
        .decl-paragraph {
          margin: 5mm 0;
          text-align: justify;
          font-size: 11pt;
        }
        .decl-footer {
          text-align: center;
          margin-top: 12mm;
          font-size: 10.5pt;
        }
        .decl-sign {
          text-align: center;
          margin-top: 6mm;
          font-size: 10.5pt;
        }
      </style>
    </head>
    <body>
      <div class="document decl-wrapper">
        <div class="decl-title">DECLARATION SUR L’HONNEUR</div>
        <div class="decl-subtitle">(Article  47 de l’Acte Uniforme relatif au Droit commercial  général adopté le 15 décembre 2010)</div>

        <div class="decl-field"><strong>NOM :</strong> ${escapeHtml(gerantNom.toUpperCase())}</div>
        <div class="decl-field"><strong>PRENOMS :</strong> ${escapeHtml(gerantPrenoms.toUpperCase())}</div>
        <div class="decl-field"><strong>DE :</strong> ${escapeHtml(gerantPereNom.toUpperCase())}</div>
        <div class="decl-field"><strong>Et DE :</strong> ${escapeHtml(gerantMereNom.toUpperCase())}</div>
        <div class="decl-field"><strong>DATE DE NAISSANCE :</strong>   ${gerantDateNaissance}</div>
        <div class="decl-field"><strong>NATIONALITE :</strong> ${escapeHtml(gerantNationalite.toUpperCase())}</div>
        <div class="decl-field"><strong>DOMICILE :</strong> ${escapeHtml(gerantDomicile.toUpperCase())}</div>
        <div class="decl-field"><strong>QUALITE :</strong> GERANT</div>

        <div class="decl-paragraph">Déclare, conformément à l’article 47 de l’Acte Uniforme relatif au Droit Commercial  Général adopté le 15 décembre 2010, au titre du Registre de commerce et du Crédit Mobilier,</div>
        <div class="decl-paragraph">N’avoir fait l’objet d’aucune condamnation pénale, ni de sanction professionnelle ou administrative de nature à m’interdire de gérer, administrer ou diriger une société ou l’exercice d’une activité commerciale.</div>
        <div class="decl-paragraph">M’engage dans un délai de 75 jours à compter de l’immatriculation à fournir mon casier judiciaire ou tout autre document en tenant lieu.</div>
        <div class="decl-paragraph">Je prends acte de ce qu’à défaut de produire l’extrait du casier judiciaire ou tout document en tenant lieu dans le délai de soixante-quinze (75) jours, il sera procédé au retrait de mon immatriculation et à ma radiation.</div>

        <div class="decl-footer">Fait à ${escapeHtml(company.city || 'Abidjan')} le : ${dateActuelle}</div>
        <div class="decl-sign">(Lu et approuvé suivi de la signature)</div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template HTML: DSV - Format officiel avec page de garde (sans couleurs)
 */
const generateDSVHTML = (company, associates, managers, additionalData = {}) => {
  const content = generateDSV(company, associates, additionalData);
  return buildHtmlDocumentFromTemplateText(content);
};

/**
 * Template HTML: Formulaire CEPICI - Format officiel
 */
const generateFormulaireCEPICIHTML = (company, managers, associates, additionalData = {}) => {
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  
  // Debug: Afficher les données reçues
  console.log('🔍 [CEPICI] company:', JSON.stringify(company, null, 2));
  console.log('🔍 [CEPICI] additionalData:', JSON.stringify(additionalData, null, 2));

  const armoiriesDataUri = readImageAsDataUri('armoiries-ci.png');
  const cepiciLogoDataUri = readImageAsDataUri('logo-cepici.png');
  
  const capital = parseFloat(company.capital) || 0;
  const capitalNumeraire = capital;
  const apportsNature = 0;
  const dureeSociete = company.duree_societe || company.dureeSociete || 99;
  
  const dateActuelle = formatDate(new Date().toISOString());
  
  // Récupérer les champs du gérant
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : '';
  const gerantAdresse = gerant?.adresse || gerant?.address || '';
  const gerantNationalite = gerant?.nationalite || gerant?.nationality || '';
  const gerantDateNaissance = (gerant?.date_naissance || gerant?.dateNaissance) ? formatDate(gerant.date_naissance || gerant.dateNaissance) : '';
  const gerantLieuNaissance = gerant?.lieu_naissance || gerant?.lieuNaissance || '';
  const gerantTypeId = gerant?.type_identite || gerant?.typeIdentite || 'passeport';
  const gerantNumId = gerant?.numero_identite || gerant?.numeroIdentite || '';
  const gerantDateDelivranceId = (gerant?.date_delivrance_id || gerant?.dateDelivranceId) ? formatDate(gerant.date_delivrance_id || gerant.dateDelivranceId) : '';
  const gerantDateValiditeId = (gerant?.date_validite_id || gerant?.dateValiditeId) ? formatDate(gerant.date_validite_id || gerant.dateValiditeId) : '';
  
  // Récupérer les données du déclarant - vérifier plusieurs sources
  const declarant = additionalData.declarant || company.declarant || {};
  const declarantNom = declarant.nom || additionalData.declarant_nom || gerantNom || '';
  const declarantQualite = declarant.qualite || additionalData.declarant_qualite || '';
  const declarantAdresse = declarant.adresse || additionalData.declarant_adresse || gerantAdresse || '';
  const declarantTel = declarant.telephone || additionalData.declarant_telephone || company.telephone || '';
  const declarantFax = declarant.fax || additionalData.declarant_fax || '';
  const declarantMobile = declarant.mobile || additionalData.declarant_mobile || '';
  const declarantEmail = declarant.email || additionalData.declarant_email || company.email || '';
  
  // Récupérer les projections sur 3 ans - vérifier plusieurs sources
  const projections = additionalData.projections || company.projections || {};
  const investAnnee1 = projections.investissement_annee1 || projections.investissementAnnee1 || additionalData.investissement_annee1 || '';
  const investAnnee2 = projections.investissement_annee2 || projections.investissementAnnee2 || additionalData.investissement_annee2 || '';
  const investAnnee3 = projections.investissement_annee3 || projections.investissementAnnee3 || additionalData.investissement_annee3 || '';
  const emploisAnnee1 = projections.emplois_annee1 || projections.emploisAnnee1 || additionalData.emplois_annee1 || '';
  const emploisAnnee2 = projections.emplois_annee2 || projections.emploisAnnee2 || additionalData.emplois_annee2 || '';
  const emploisAnnee3 = projections.emplois_annee3 || projections.emploisAnnee3 || additionalData.emplois_annee3 || '';
  
  // Récupérer les champs de localisation - vérifier plusieurs sources (camelCase et snake_case)
  const commune = additionalData.commune || company.commune || '';
  const quartier = additionalData.quartier || company.quartier || '';
  const lotNumero = additionalData.lot || company.lot || '';
  const ilotNumero = additionalData.ilot || company.ilot || '';
  const nomImmeuble = additionalData.nomImmeuble || additionalData.nom_immeuble || company.nomImmeuble || company.nom_immeuble || '';
  const numeroEtage = additionalData.numeroEtage || additionalData.numero_etage || company.numeroEtage || company.numero_etage || '';
  const numeroPorte = additionalData.numeroPorte || additionalData.numero_porte || company.numeroPorte || company.numero_porte || '';
  const section = additionalData.section || company.section || '';
  const parcelle = additionalData.parcelle || company.parcelle || '';
  const tfNumero = additionalData.tfNumero || additionalData.tf_numero || company.tfNumero || company.tf_numero || '';
  const fax = additionalData.fax || company.fax || '';
  const adressePostale = additionalData.adressePostale || additionalData.adresse_postale || company.adressePostale || company.adresse_postale || '';
  
  console.log('🔍 [CEPICI] Projections:', { investAnnee1, investAnnee2, investAnnee3, emploisAnnee1, emploisAnnee2, emploisAnnee3 });
  console.log('🔍 [CEPICI] Declarant:', { declarantNom, declarantQualite, declarantAdresse });

  // Construire la liste des associés/actionnaires pour la section V (format texte numéroté)
  let associesHTML = '';
  if (associates && associates.length > 0) {
    associates.forEach((associe, index) => {
      const assocNom = `${associe.nom || ''} ${associe.prenoms || ''}`.trim();
      const assocAdresse = associe.adresse || associe.address || '';
      const assocNationalite = associe.nationalite || associe.nationality || '';
      const assocDateNaissance = (associe.date_naissance || associe.dateNaissance) ? formatDate(associe.date_naissance || associe.dateNaissance) : '';
      const assocLieuNaissance = associe.lieu_naissance || associe.lieuNaissance || '';
      const assocProfession = associe.profession || '';
      const assocTypeId = associe.type_identite || associe.typeIdentite || 'CNI';
      const assocNumId = associe.numero_identite || associe.numeroIdentite || '';
      const assocDateDelivrance = (associe.date_delivrance_id || associe.dateDelivranceId) ? formatDate(associe.date_delivrance_id || associe.dateDelivranceId) : '';
      const assocDateValidite = (associe.date_validite_id || associe.dateValiditeId) ? formatDate(associe.date_validite_id || associe.dateValiditeId) : '';
      const assocPays = associe.pays || associe.country || 'la République de Côte d\'Ivoire';
      
      associesHTML += `
        <p style="margin-bottom: 15px; text-align: justify;">
          <strong>${index + 1}- M. ${escapeHtml(assocNom.toUpperCase())}</strong>, ${escapeHtml(assocProfession)} résidant à ${escapeHtml(assocAdresse.toUpperCase())} de nationalité ${escapeHtml(assocNationalite)}, né le ${assocDateNaissance} à ${escapeHtml(assocLieuNaissance.toUpperCase())}${assocNumId ? ` et titulaire du ${escapeHtml(assocTypeId)} N°${escapeHtml(assocNumId)} délivrée le ${assocDateDelivrance} et valable jusqu'au ${assocDateValidite} par ${escapeHtml(assocPays)}` : ''}.
        </p>
      `;
    });
  }

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        ${getCommonStyles()}
        
        .cepici-page {
          font-family: 'Times New Roman', serif;
          font-size: 10pt;
          line-height: 1.4;
        }
        
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        
        .header-left {
          text-align: center;
          width: 30%;
        }
        
        .header-right {
          text-align: center;
          width: 30%;
        }
        
        .armoiries-title {
          font-weight: bold;
          font-size: 10pt;
        }
        
        .cepici-logo {
          font-weight: bold;
          font-size: 14pt;
        }
        
        .main-title-box {
          text-align: center;
          margin: 20px 0;
        }
        
        .main-title-box h1 {
          font-size: 12pt;
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 5px;
        }
        
        .main-title-box h2 {
          font-size: 11pt;
          font-weight: normal;
        }
        
        .cadre-reserve {
          border: 1px solid #000;
          padding: 10px;
          margin: 15px 0;
          font-size: 9pt;
        }
        
        .cadre-reserve-title {
          text-align: center;
          font-weight: bold;
          margin-bottom: 10px;
          font-size: 9pt;
        }
        
        .cadre-row {
          margin: 5px 0;
        }
        
        .declarant-box {
          border: 1px solid #000;
          padding: 10px;
          margin: 15px 0;
        }
        
        .declarant-title {
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 10px;
          font-size: 9pt;
        }
        
        .declarant-row {
          margin: 3px 0;
          font-size: 9pt;
        }
        
        .section-title {
          font-weight: bold;
          text-decoration: underline;
          margin: 15px 0 10px 0;
          font-size: 10pt;
        }
        
        .projection-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 9pt;
        }
        
        .projection-table th,
        .projection-table td {
          border: 1px solid #000;
          padding: 5px 8px;
          text-align: center;
        }
        
        .projection-table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        .projection-table td:first-child {
          text-align: left;
          font-weight: bold;
        }
        
        .form-line {
          margin: 5px 0;
          font-size: 10pt;
        }
        
        .page-footer {
          font-size: 8pt;
          text-align: center;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #000;
        }
      </style>
    </head>
    <body>
      <div class="cepici-page">
        
        <!-- EN-TÊTE -->
        <div class="header-section">
          <div class="header-left">
            <p class="armoiries-title">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
            <p style="font-style: italic; font-size: 9pt;">Union - Discipline - Travail</p>
          </div>
          <div style="text-align: center; width: 40%;">
            ${armoiriesDataUri ? `<img src="${armoiriesDataUri}" style="height: 55px; width: auto;" />` : ''}
          </div>
          <div class="header-right">
            <p style="font-size: 9pt;">Présidence de la République</p>
            ${cepiciLogoDataUri ? `<img src="${cepiciLogoDataUri}" style="height: 32px; width: auto; display: block; margin: 0 auto 4px auto;" />` : ''}
            <p class="cepici-logo">CEPICI</p>
            <p style="font-size: 8pt;">CENTRE DE PROMOTION DES INVESTISSEMENTS<br>EN CÔTE D'IVOIRE</p>
          </div>
        </div>
        
        <!-- TITRE PRINCIPAL -->
        <div class="main-title-box">
          <h1>FORMULAIRE UNIQUE</h1>
          <h2>D'IMMATRICULATION DES ENTREPRISES</h2>
          <p>(PERSONNES MORALES)</p>
        </div>
        
        <!-- CADRE RÉSERVÉ AU CEPICI -->
        <div class="cadre-reserve">
          <p class="cadre-reserve-title">CADRE RÉSERVÉ AU CEPICI</p>
          <div class="cadre-row">DOSSIER N° ………………………………………………</div>
          <div class="cadre-row">DATE DE RÉCEPTION ………………………………………………</div>
          <div class="cadre-row">NUMÉRO REGISTRE DE COMMERCE : ………………………………………………</div>
          <div class="cadre-row">NUMÉRO COMPTE CONTRIBUABLE : ………………………………………………</div>
          <div class="cadre-row">NUMÉRO CNPS ENTREPRISE : ………………………………………………</div>
          <div class="cadre-row">CODE IMPORT-EXPORT : ………………………………………………</div>
        </div>
        
        <!-- DÉCLARANT RESPONSABLE -->
        <div class="declarant-box">
          <p class="declarant-title">DÉCLARANT RESPONSABLE POUR L'ACCOMPLISSEMENT DES FORMALITÉS</p>
          <div class="declarant-row">DÉCLARATION ÉTABLIE PAR : <strong>M. ${escapeHtml(declarantNom.toUpperCase())}</strong></div>
          <div class="declarant-row">AGISSANT EN QUALITÉ DE : <strong>${escapeHtml(declarantQualite.toUpperCase())}</strong></div>
          <div class="declarant-row">NUMÉRO DE COMPTE CONTRIBUABLE : ………………………………………………</div>
          <div class="declarant-row">ADRESSE PERSONNELLE : <strong>${escapeHtml(declarantAdresse.toUpperCase())}</strong></div>
          <div class="declarant-row" style="margin-top: 8px;">
            TEL : <strong>${escapeHtml(declarantTel)}</strong> FAX : <strong>${escapeHtml(declarantFax)}</strong> MOBILE : <strong>${escapeHtml(declarantMobile)}</strong>
          </div>
          <div class="declarant-row">E-MAIL : <strong>${escapeHtml(declarantEmail)}</strong></div>
        </div>
        
        <!-- I- IDENTIFICATION -->
        <p class="section-title">I- IDENTIFICATION</p>
        
        <table class="projection-table">
          <thead>
            <tr>
              <th></th>
              <th>ANNÉE 1</th>
              <th>ANNÉE 2</th>
              <th>ANNÉE 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Montant d'Investissement (projeté)</td>
              <td>${investAnnee1 ? parseInt(investAnnee1).toLocaleString('fr-FR') : ''}</td>
              <td>${investAnnee2 ? parseInt(investAnnee2).toLocaleString('fr-FR') : ''}</td>
              <td>${investAnnee3 ? parseInt(investAnnee3).toLocaleString('fr-FR') : ''}</td>
            </tr>
            <tr>
              <td>Nombre d'Emplois (projetés)</td>
              <td>${emploisAnnee1}</td>
              <td>${emploisAnnee2}</td>
              <td>${emploisAnnee3}</td>
            </tr>
          </tbody>
        </table>
        
        <p class="page-footer">
          CEPICI : BP V152 ABIDJAN 01 - ABIDJAN PLATEAU 2ème étage immeuble DJEKANOU Tel : (225) 20 30 23 85 - Fax : (225) 20 21 40 71 - Site web : www.cepici.gouv.ci
        </p>
        
        <!-- PAGE 2 -->
        <div class="page-break"></div>
        
        <div class="form-line">Dénomination sociale : ………… <strong>${escapeHtml((company.company_name || '').toUpperCase())} SARL</strong> …………………………</div>
        <div class="form-line">Nom commercial : ………………………………………………………………………………………</div>
        <div class="form-line">Sigle : ………………………………</div>
        <div class="form-line">Durée : ………… <strong>${dureeSociete} ANS</strong> …………………………………………………………</div>
        <div class="form-line">Forme juridique : ………… <strong>SARL U</strong> ……………………………………………………………</div>
        <div class="form-line">Montant du capital : ………… <strong>${capital.toLocaleString('fr-FR')} FCFA</strong> …… Dont : Montant en numéraire ………… <strong>${capitalNumeraire.toLocaleString('fr-FR')}</strong></div>
        <div class="form-line" style="margin-left: 200px;">Évaluation des apports en nature ………… <strong>${apportsNature}</strong> ……………………</div>
        
        <!-- II- ACTIVITÉ -->
        <p class="section-title">II- ACTIVITÉ (renseignements sur la personne morale)</p>
        
        <div class="form-line">Activité principale : <strong>${escapeHtml(company.activity || '')}</strong></div>
        <div class="form-line">Activités secondaires : ………………………………</div>
        <div class="form-line">Chiffre d'affaires prévisionnel : ………… <strong>${company.chiffre_affaires_prev ? parseInt(company.chiffre_affaires_prev).toLocaleString('fr-FR') : '5 000 001'} FCFA</strong> / TAXE D'ÉTAT DE L'ENTREPRENEUR</div>
        <div class="form-line">Nombre d'employés : ………… <strong>1 (UN)</strong> ………… Date embauche 1er employé : <strong>${dateActuelle}</strong></div>
        <div class="form-line">Date de début d'activité : ………… <strong>${dateActuelle}</strong> ……………</div>
        
        <!-- III- LOCALISATION -->
        <p class="section-title">III- LOCALISATION DU SIÈGE SOCIAL / DE LA SUCCURSALE</p>
        
        <div class="form-line">Ville : …<strong>${escapeHtml((company.city || 'ABIDJAN').toUpperCase())}</strong>… Commune : …<strong>${escapeHtml(commune.toUpperCase())}</strong>… Quartier : …<strong>${escapeHtml(quartier.toUpperCase())}</strong>…</div>
        <div class="form-line">Rue : …<strong>${escapeHtml((company.address || '').toUpperCase())}</strong>… Lot n° : …<strong>${escapeHtml(lotNumero)}</strong>… Ilot n° : …<strong>${escapeHtml(ilotNumero)}</strong>…</div>
        <div class="form-line">Nom immeuble : …<strong>${escapeHtml(nomImmeuble.toUpperCase())}</strong>… Numéro étage : …<strong>${escapeHtml(numeroEtage)}</strong>… Numéro porte : …<strong>${escapeHtml(numeroPorte)}</strong>…</div>
        <div class="form-line">Section : …<strong>${escapeHtml(section)}</strong>… Parcelle : …<strong>${escapeHtml(parcelle)}</strong>…</div>
        <div class="form-line">TF n° : …<strong>${escapeHtml(tfNumero)}</strong>… Tél. : …<strong>${escapeHtml(company.telephone || '')}</strong>…</div>
        <div class="form-line">Fax : …<strong>${escapeHtml(fax)}</strong>…</div>
        <div class="form-line">Adresse postale : …<strong>${escapeHtml(adressePostale)}</strong>… Email : …<strong>${escapeHtml(company.email || '')}</strong>…</div>
        
        <!-- IV- ÉTABLISSEMENTS SECONDAIRES -->
        <p class="section-title">IV- ÉTABLISSEMENTS SECONDAIRES</p>
        <div class="form-line">Néant</div>
        
        <!-- PAGE 3 - DIRIGEANTS, ACTIONNAIRES, COMMISSAIRES -->
        <div class="page-break"></div>
        
        <p class="section-title">V- INFORMATIONS SUR LES DIRIGEANTS, ACTIONNAIRES ET COMMISSAIRES AUX COMPTES</p>
        
        <p style="font-weight: bold; margin: 15px 0; text-decoration: underline;">A- DIRIGEANT SOCIAL</p>
        
        <div class="form-line">Nom et Prénoms : <strong>${escapeHtml(gerantNom.toUpperCase())}</strong></div>
        <div class="form-line">Nationalité : <strong>${escapeHtml(gerantNationalite)}</strong></div>
        <div class="form-line">Date de naissance : <strong>${gerantDateNaissance}</strong> Lieu de naissance : <strong>${escapeHtml(gerantLieuNaissance.toUpperCase())}</strong></div>
        <div class="form-line">Adresse : <strong>${escapeHtml(gerantAdresse.toUpperCase())}</strong></div>
        <div class="form-line">Fonction : <strong>GÉRANT</strong></div>
        
        ${gerantTypeId && gerantNumId ? `
        <div class="form-line" style="margin-top: 10px;">
          Titulaire du ${escapeHtml(gerantTypeId.toUpperCase())} N°${escapeHtml(gerantNumId)} délivrée le ${gerantDateDelivranceId} et valable jusqu'au ${gerantDateValiditeId}
        </div>
        ` : ''}
        
        <p style="font-weight: bold; margin: 20px 0 15px 0; text-decoration: underline;">B- ASSOCIÉS / ACTIONNAIRES</p>
        
        ${associesHTML || '<div class="form-line">Voir liste des associés ci-jointe</div>'}
        
        <p style="font-weight: bold; margin: 20px 0 15px 0; text-decoration: underline;">C- COMMISSAIRE AUX COMPTES</p>
        <div class="form-line">Néant (Capital inférieur à 100 000 000 FCFA)</div>
        
        <!-- SIGNATURE -->
        <div style="border: 1px solid #000; padding: 20px; margin-top: 30px; min-height: 100px;">
          <p style="text-align: right; margin-bottom: 10px;">Fait à ${escapeHtml((company.city || 'Abidjan'))}, le ${dateActuelle}</p>
          <p style="text-align: center; font-weight: bold; font-size: 12pt;">Signature</p>
        </div>
        
      </div>
    </body>
    </html>
  `;
};

/**
 * Générer un PDF à partir du HTML avec Puppeteer
 * @param {string} htmlContent - Contenu HTML
 * @param {string} outputPath - Chemin de sortie du PDF
 * @param {object} options - Options personnalisées pour le PDF (optionnel)
 */
export const generatePDFWithPuppeteer = async (htmlContent, outputPath, options = {}) => {
  console.log(`📄 [Puppeteer] Génération PDF: ${outputPath}`);
  
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Options par défaut
    const defaultOptions = {
      path: outputPath,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width: 100%; font-size: 9px; padding: 0 15mm; color: #000;">
          <div style="width: 100%; text-align: right;">
            <span class="pageNumber"></span>/<span class="totalPages"></span>
          </div>
        </div>
      `,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    };
    
    // Si options personnalisées, on les fusionne (désactive header/footer si margin personnalisé)
    const pdfOptions = options.margin ? {
      path: outputPath,
      format: options.format || 'A4',
      printBackground: options.printBackground !== false,
      preferCSSPageSize: options.preferCSSPageSize || false,
      margin: options.margin
    } : defaultOptions;
    
    await page.pdf(pdfOptions);
    
    console.log(`✅ [Puppeteer] PDF généré avec succès: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ [Puppeteer] Erreur génération PDF:`, error);
    throw error;
  } finally {
    await page.close();
  }
};

/**
 * Mapper les noms de documents vers les fonctions de génération HTML
 */
const htmlGenerators = {
  'Statuts SARL': (company, associates, managers, additionalData) => generateStatutsHTML(company, associates, managers),
  'Statuts': (company, associates, managers, additionalData) => generateStatutsHTML(company, associates, managers),
  'Contrat de bail commercial': (company, associates, managers, additionalData) => generateContratBailHTML(company, additionalData),
  'Contrat de bail': (company, associates, managers, additionalData) => generateContratBailHTML(company, additionalData),
  'Formulaire unique CEPICI': (company, associates, managers, additionalData) => generateFormulaireCEPICIHTML(company, managers, associates, additionalData),
  'Formulaire CEPICI': (company, associates, managers, additionalData) => generateFormulaireCEPICIHTML(company, managers, associates, additionalData),
  'Liste des dirigeants/gérants': (company, associates, managers, additionalData) => generateListeGerantsHTML(company, managers, additionalData),
  'Liste de Gérant': (company, associates, managers, additionalData) => generateListeGerantsHTML(company, managers, additionalData),
  'Liste des gérants': (company, associates, managers, additionalData) => generateListeGerantsHTML(company, managers, additionalData),
  "Déclaration sur l'honneur (greffe)": (company, associates, managers, additionalData) => generateDeclarationHonneurHTML(company, managers),
  "Déclaration sur l'honneur": (company, associates, managers, additionalData) => generateDeclarationHonneurHTML(company, managers),
  'Déclaration de Souscription et Versement (DSV)': (company, associates, managers, additionalData) => generateDSVHTML(company, associates, managers, additionalData),
  'DSV': (company, associates, managers, additionalData) => generateDSVHTML(company, associates, managers, additionalData),
  'Déclaration Souscription/Versement': (company, associates, managers, additionalData) => generateDSVHTML(company, associates, managers, additionalData),
};

/**
 * Générer le HTML d'un document sans produire de PDF
 */
export const generateDocumentHTML = (docName, company, associates = [], managers = [], additionalData = {}) => {
  let generator = htmlGenerators[docName];

  if (!generator) {
    for (const [key, gen] of Object.entries(htmlGenerators)) {
      if (docName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(docName.toLowerCase())) {
        generator = gen;
        break;
      }
    }
  }

  if (!generator) {
    throw new Error(`Template HTML non trouvé pour: ${docName}`);
  }

  return generator(company, associates, managers, additionalData);
};

/**
 * Générer un document PDF avec Puppeteer
 */
export const generateDocumentPDF = async (docName, company, associates = [], managers = [], additionalData = {}, outputPath) => {
  console.log(`\n🔧 [Puppeteer] Génération document: "${docName}"`);

  // CEPICI: utiliser le nouveau générateur HTML + Puppeteer (rendu pixel-perfect)
  if (docName.toLowerCase().includes('cepici')) {
    console.log(`   🧾 [CEPICI] Génération via HTML + Puppeteer: ${outputPath}`);
    const htmlContent = generateCepiciHtml(company, managers, associates, additionalData);
    
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
          <div style="width: 100%; font-size: 8px; text-align: center; color: #444; padding: 0 12mm;">
            CEPICI : BP V152 ABIDJAN 01 – ABIDJAN PLATEAU 2<sup>ème</sup> étage immeuble DJEKANOU Tel : (225) 20 30 23 85 – Fax : (225) 20 21 40 71 – Site web : www.cepici.gouv.ci
          </div>
        `,
        margin: { top: '12mm', right: '12mm', bottom: '18mm', left: '12mm' }
      });
      
      console.log(`✅ [CEPICI] PDF généré: ${outputPath}`);
    } finally {
      await page.close();
    }
    return outputPath;
  }
  
  // Trouver le générateur HTML approprié
  let generator = htmlGenerators[docName];
  
  if (!generator) {
    // Essayer de trouver par correspondance partielle
    for (const [key, gen] of Object.entries(htmlGenerators)) {
      if (docName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(docName.toLowerCase())) {
        generator = gen;
        console.log(`   📝 Correspondance trouvée: "${key}"`);
        break;
      }
    }
  }
  
  if (!generator) {
    throw new Error(`Template HTML non trouvé pour: ${docName}`);
  }
  
  // Générer le HTML
  const htmlContent = generator(company, associates, managers, additionalData);
  
  // Générer le PDF
  await generatePDFWithPuppeteer(htmlContent, outputPath);
  
  return outputPath;
};

export default {
  generateDocumentPDF,
  generatePDFWithPuppeteer,
  generateDocumentHTML,
  closeBrowser
};
